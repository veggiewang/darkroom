use serde::{Deserialize, Serialize};
use tauri::{command, AppHandle, Manager};
use std::process::Command;

#[derive(Debug, Deserialize)]
pub struct ExifTask {
    pub file_path: String,
    pub camera_make_model: String,
    pub lens: String,
    pub film_stock: String,
    pub iso: String,
    pub location: Option<String>,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub date_shot: Option<String>,
    pub developer: Option<String>,
    pub scanner: Option<String>,
    pub author: Option<String>,
    pub ev: Option<String>,
    pub aperture: Option<String>,
    pub shutter_speed: Option<String>,
    pub notes: Option<String>,
    pub focal_length: Option<String>,
}

#[derive(Serialize)]
pub struct ProcessResult {
    pub success: bool,
    pub file_path: String,
    pub error_message: Option<String>,
}

#[command]
pub async fn write_exif_batch(app: AppHandle, tasks: Vec<ExifTask>) -> Result<Vec<ProcessResult>, String> {
    if tasks.is_empty() { return Ok(Vec::new()); }

    // 每个文件一组参数，组之间用 -execute 分隔
    let mut groups: Vec<Vec<String>> = Vec::new();
    for task in tasks.iter() {
        if task.file_path.to_lowercase().ends_with(".bmp") { continue; }
        let mut args = Vec::new();
        if !task.camera_make_model.is_empty() {
            args.push(format!("-Model={}", task.camera_make_model));
            args.push(format!("-Make={}", task.camera_make_model));
        }
        if !task.lens.is_empty() { args.push(format!("-LensModel={}", task.lens)); }
        if !task.iso.is_empty() { args.push(format!("-ISO={}", task.iso)); }
        let mut comment_parts: Vec<String> = vec![format!("Film: {}", task.film_stock)];
        if let Some(loc) = &task.location {
            if !loc.is_empty() {
                comment_parts.push(format!("Location: {}", loc));
                args.push(format!("-IPTC:City={}", loc));
                args.push(format!("-XMP:City={}", loc));
            }
        }
        if let Some(dev) = &task.developer { if !dev.is_empty() { comment_parts.push(format!("Dev: {}", dev)); } }
        if let Some(scan) = &task.scanner { if !scan.is_empty() { comment_parts.push(format!("Scanner: {}", scan)); } }
        args.push(format!("-UserComment={}", comment_parts.join(" | ")));
        if let (Some(lat), Some(lon)) = (task.latitude, task.longitude) {
            let lat_ref = if lat >= 0.0 { "N" } else { "S" };
            let lon_ref = if lon >= 0.0 { "E" } else { "W" };
            args.push(format!("-GPSLatitude={}", lat.abs()));
            args.push(format!("-GPSLatitudeRef={}", lat_ref));
            args.push(format!("-GPSLongitude={}", lon.abs()));
            args.push(format!("-GPSLongitudeRef={}", lon_ref));
        }
        if let Some(author) = &task.author {
            if !author.is_empty() {
                args.push(format!("-Artist={}", author));
                args.push(format!("-XMP:Creator={}", author));
                args.push(format!("-Copyright=© {}", author));
            }
        }
        if let Some(ev) = &task.ev { if !ev.is_empty() { args.push(format!("-ExposureCompensation={}", ev)); } }
        if let Some(date) = &task.date_shot {
            if !date.is_empty() {
                let formatted = format!("{} 12:00:00", date.replace("-", ":"));
                args.push(format!("-DateTimeOriginal={}", formatted));
                args.push(format!("-CreateDate={}", formatted));
            }
        }
        if let Some(ap) = &task.aperture { if !ap.is_empty() { args.push(format!("-FNumber={}", ap)); } }
        if let Some(sh) = &task.shutter_speed { if !sh.is_empty() { args.push(format!("-ExposureTime={}", sh)); } }
        if let Some(fl) = &task.focal_length { if !fl.is_empty() { args.push(format!("-FocalLength={}", fl)); } }
        if let Some(n) = &task.notes { if !n.is_empty() { args.push(format!("-ImageDescription={}", n)); } }
        if is_tiff(&task.file_path) {
            // 部分扫描仪 (如 QS3233) 输出的 TIFF 中 X/YResolution 偏移量损坏 (exiftool 报 "Suspicious IFD0 offset")，
            // 读出来是 0.006 dpi 这种垃圾值。只在出现该警告时重写为 72 dpi，正常文件不动
            args.push("-XResolution<${Warning;$_ = /offset for [XY]Resolution/ ? 72 : undef}".to_string());
            args.push("-YResolution<${Warning;$_ = /offset for [XY]Resolution/ ? 72 : undef}".to_string());
        }
        args.push(task.file_path.clone());
        groups.push(args);
    }

    if groups.is_empty() {
        return Ok(tasks.into_iter().map(|t| ProcessResult { success: false, file_path: t.file_path, error_message: Some("BMP 不支持写入 EXIF".to_string()) }).collect());
    }

    let mut args: Vec<String> = Vec::new();
    for (i, group) in groups.into_iter().enumerate() {
        if i > 0 { args.push("-execute".to_string()); }
        args.extend(group);
    }
    args.push("-common_args".to_string());
    args.push("-overwrite_original".to_string());
    // -m: 忽略 [minor] 级别错误（如扫描仪写坏的 IFD 偏移），否则 exiftool 会拒绝写入整个文件
    args.push("-m".to_string());

    let resource_dir = app.path().resource_dir().map_err(|e| e.to_string())?;

    #[cfg(windows)]
    let output = {
        let win_res = resource_dir.join("resources/exiftool-win");
        Command::new(win_res.join("perl.exe"))
            .arg(win_res.join("exiftool.pl"))
            .args(args)
            .output()
            .map_err(|e| format!("Windows Exec Error: {}", e))?
    };

    #[cfg(not(windows))]
    let output = {
        let core_res = resource_dir.join("resources/exiftool-core");
        Command::new("perl")
            .env("PERL5LIB", core_res.join("lib"))
            .arg(core_res.join("exiftool"))
            .args(args)
            .output()
            .map_err(|e| format!("Unix Exec Error: {}", e))?
    };

    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();

    // 一条命令批量处理多个文件，按文件名从 stderr 中找出各自的错误，而不是一个失败就全部算失败
    let error_lines: Vec<&str> = stderr.lines().filter(|l| l.starts_with("Error")).collect();
    let results: Vec<ProcessResult> = tasks.into_iter().map(|t| {
        if t.file_path.to_lowercase().ends_with(".bmp") {
            return ProcessResult { success: false, file_path: t.file_path, error_message: Some("BMP 不支持写入 EXIF".to_string()) };
        }
        let suffix = format!(" - {}", t.file_path);
        match error_lines.iter().find(|l| l.ends_with(&suffix)) {
            Some(line) => ProcessResult {
                success: false,
                error_message: Some(line.trim_end_matches(&suffix).to_string()),
                file_path: t.file_path,
            },
            None => ProcessResult { success: true, file_path: t.file_path, error_message: None },
        }
    }).collect();

    if !output.status.success() && results.iter().all(|r| r.success) {
        // 失败了但匹配不到具体文件（比如 perl 本身出错），把原始输出抛给前端
        return Err(format!("ExifTool Error: {}{}", stderr, stdout));
    }
    Ok(results)
}

fn is_tiff(path: &str) -> bool {
    let lower = path.to_lowercase();
    lower.ends_with(".tif") || lower.ends_with(".tiff")
}
