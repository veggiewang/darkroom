use serde::{Deserialize, Serialize};
use tauri::{command, AppHandle, Manager};
use tauri_plugin_shell::ShellExt;
use std::path::Path;

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
    if tasks.is_empty() {
        return Ok(Vec::new());
    }

    // --- 批量参数构建 ---
    // 为了极致性能，我们构建一个“参数列表”。
    // ExifTool 支持在单次调用中使用 -execute 处理多个文件。
    // 语法：exiftool [FILE1_ARGS] FILE1 -execute [FILE2_ARGS] FILE2 -common_args -overwrite_original
    
    let mut args = Vec::new();

    for (i, task) in tasks.iter().enumerate() {
        // BMP 跳过处理
        let lower_path = task.file_path.to_lowercase();
        if lower_path.ends_with(".bmp") {
            continue; 
        }

        // 基础信息
        if !task.camera_make_model.is_empty() {
            args.push(format!("-Model={}", task.camera_make_model));
            args.push(format!("-Make={}", task.camera_make_model));
        }
        
        if !task.lens.is_empty() {
            args.push(format!("-LensModel={}", task.lens));
        }

        if !task.iso.is_empty() {
            args.push(format!("-ISO={}", task.iso));
        }

        // 构建 UserComment
        let mut comment_parts: Vec<String> = vec![format!("Film: {}", task.film_stock)];
        if let Some(location) = &task.location {
            if !location.is_empty() {
                comment_parts.push(format!("Location: {}", location));
                args.push(format!("-IPTC:City={}", location));
                args.push(format!("-XMP:City={}", location));
            }
        }
        if let Some(dev) = &task.developer {
            if !dev.is_empty() { comment_parts.push(format!("Dev: {}", dev)); }
        }
        if let Some(scan) = &task.scanner {
            if !scan.is_empty() { comment_parts.push(format!("Scanner: {}", scan)); }
        }
        args.push(format!("-UserComment={}", comment_parts.join(" | ")));

        // GPS
        if let (Some(lat), Some(lon)) = (task.latitude, task.longitude) {
            let lat_ref = if lat >= 0.0 { "N" } else { "S" };
            let lon_ref = if lon >= 0.0 { "E" } else { "W" };
            args.push(format!("-GPSLatitude={}", lat.abs()));
            args.push(format!("-GPSLatitudeRef={}", lat_ref));
            args.push(format!("-GPSLongitude={}", lon.abs()));
            args.push(format!("-GPSLongitudeRef={}", lon_ref));
        }

        // 作者
        if let Some(author) = &task.author {
            if !author.is_empty() {
                args.push(format!("-Artist={}", author));
                args.push(format!("-XMP:Creator={}", author));
                args.push(format!("-Copyright=© {}", author));
            }
        }

        // 曝光 & 日期
        if let Some(ev) = &task.ev {
            if !ev.is_empty() { args.push(format!("-ExposureCompensation={}", ev)); }
        }

        if let Some(date) = &task.date_shot {
            if !date.is_empty() {
                let formatted_date = format!("{} 12:00:00", date.replace("-", ":"));
                args.push(format!("-DateTimeOriginal={}", formatted_date));
                args.push(format!("-CreateDate={}", formatted_date));
            }
        }

        // 帧特定
        if let Some(aperture) = &task.aperture {
            if !aperture.is_empty() { args.push(format!("-FNumber={}", aperture)); }
        }
        if let Some(shutter) = &task.shutter_speed {
            if !shutter.is_empty() { args.push(format!("-ExposureTime={}", shutter)); }
        }
        if let Some(focal) = &task.focal_length {
            if !focal.is_empty() { args.push(format!("-FocalLength={}", focal)); }
        }
        if let Some(notes) = &task.notes {
            if !notes.is_empty() { args.push(format!("-ImageDescription={}", notes)); }
        }

        // 文件路径
        args.push(task.file_path.clone());

        // 如果不是最后一个任务，添加 -execute 分隔符
        if i < tasks.len() - 1 {
            args.push("-execute".to_string());
        }
    }

    // 添加公共参数（对所有文件有效，放在最后）
    args.push("-common_args".to_string());
    args.push("-overwrite_original".to_string());

    // --- 调用 Sidecar (内嵌的 exiftool) ---
    // Tauri 会根据系统自动查找 bin/exiftool-x86_64-apple-darwin 等
    let sidecar_command = app.shell().sidecar("exiftool").map_err(|e| e.to_string())?;
    
    let output = sidecar_command
        .args(args)
        .output()
        .await
        .map_err(|e| format!("Sidecar execution failed: {}", e))?;

    if output.status.success() {
        // 简单处理结果，由于是批量，这里假设全成功
        // 实际上可以解析 stdout 进一步确认
        Ok(tasks.into_iter().map(|t| ProcessResult {
            success: true,
            file_path: t.file_path,
            error_message: None,
        }).collect())
    } else {
        let err_msg = String::from_utf8_lossy(&output.stderr).to_string();
        Err(format!("ExifTool Error: {}", err_msg))
    }
}
