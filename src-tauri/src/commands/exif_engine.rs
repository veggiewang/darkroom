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

    let mut args = Vec::new();

    for (i, task) in tasks.iter().enumerate() {
        if task.file_path.to_lowercase().ends_with(".bmp") { continue; }

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
        if let Some(dev) = &task.developer {
            if !dev.is_empty() { comment_parts.push(format!("Dev: {}", dev)); }
        }
        if let Some(scan) = &task.scanner {
            if !scan.is_empty() { comment_parts.push(format!("Scanner: {}", scan)); }
        }
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

        if let Some(ev) = &task.ev {
            if !ev.is_empty() { args.push(format!("-ExposureCompensation={}", ev)); }
        }

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

        args.push(task.file_path.clone());
        if i < tasks.len() - 1 { args.push("-execute".to_string()); }
    }

    args.push("-common_args".to_string());
    args.push("-overwrite_original".to_string());

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

    if output.status.success() {
        Ok(tasks.into_iter().map(|t| ProcessResult { success: true, file_path: t.file_path, error_message: None }).collect())
    } else {
        let err = String::from_utf8_lossy(&output.stderr).to_string();
        Err(format!("ExifTool Error: {}", err))
    }
}
