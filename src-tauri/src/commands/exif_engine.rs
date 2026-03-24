use serde::{Deserialize, Serialize};
use std::process::Command;
use std::path::Path;
use tauri::command;

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
    pub aperture: Option<String>,
    pub shutter_speed: Option<String>,
    pub notes: Option<String>,
}

#[derive(Serialize)]
pub struct ProcessResult {
    pub success: bool,
    pub file_path: String,
    pub error_message: Option<String>,
}

#[command]
pub async fn write_exif_batch(tasks: Vec<ExifTask>) -> Result<Vec<ProcessResult>, String> {
    let mut results = Vec::new();

    // 检查是否有 exiftool
    // 对于 mac，通常可以通过 shell 调用 `exiftool`
    // 如果没有，这步会报错提示用户安装
    
    for task in tasks {
        let exiftool_path = "/usr/local/bin/exiftool"; // Mac 上的常见路径
        let mut cmd = Command::new(exiftool_path);
        
        // 兼容一下如果没在 /usr/local/bin 里的情况
        if !std::path::Path::new(exiftool_path).exists() {
            cmd = Command::new("exiftool"); 
        }

        cmd.arg("-overwrite_original");

        // 基础信息
        if !task.camera_make_model.is_empty() {
            cmd.arg(format!("-Model={}", task.camera_make_model));
            cmd.arg(format!("-Make={}", task.camera_make_model)); // 简单粗暴，把make和model写成一样
        }
        
        if !task.lens.is_empty() {
            cmd.arg(format!("-LensModel={}", task.lens));
        }

        if !task.iso.is_empty() {
            cmd.arg(format!("-ISO={}", task.iso));
        }

        // === 构建 UserComment（胶卷 + 地点 + 冲扫 + 扫描仪） ===
        let mut comment_parts: Vec<String> = vec![format!("Film: {}", task.film_stock)];
        
        if let Some(location) = &task.location {
            if !location.is_empty() {
                comment_parts.push(format!("Location: {}", location));
                // 文本地点标签（Lightroom / Bridge 等可读）
                cmd.arg(format!("-IPTC:City={}", location));
                cmd.arg(format!("-XMP:City={}", location));
            }
        }
        if let Some(dev) = &task.developer {
            if !dev.is_empty() {
                comment_parts.push(format!("Dev: {}", dev));
            }
        }
        if let Some(scan) = &task.scanner {
            if !scan.is_empty() {
                comment_parts.push(format!("Scanner: {}", scan));
            }
        }
        cmd.arg(format!("-UserComment={}", comment_parts.join(" | ")));

        // === GPS 坐标（苹果相册 / Google Photos 等必须靠这个显示地点） ===
        if let (Some(lat), Some(lon)) = (task.latitude, task.longitude) {
            let lat_ref = if lat >= 0.0 { "N" } else { "S" };
            let lon_ref = if lon >= 0.0 { "E" } else { "W" };
            cmd.arg(format!("-GPSLatitude={}", lat.abs()));
            cmd.arg(format!("-GPSLatitudeRef={}", lat_ref));
            cmd.arg(format!("-GPSLongitude={}", lon.abs()));
            cmd.arg(format!("-GPSLongitudeRef={}", lon_ref));
        }

        if let Some(scanner) = &task.scanner {
            if !scanner.is_empty() {
                // 写入扫描仪设备信息，使用原生的EXIF Scanner/Model标签
                cmd.arg(format!("-ScannerMake={}", scanner.split(' ').next().unwrap_or("Unknown")));
                cmd.arg(format!("-ScannerModel={}", scanner));
            }
        }

        if let Some(date) = &task.date_shot {
            if !date.is_empty() {
                // ExifTool needs format YYYY:MM:DD HH:MM:SS
                // The frontend passes standard YYYY-MM-DD, let's just replace hyphens with colons and append time
                let formatted_date = format!("{} 12:00:00", date.replace("-", ":"));
                cmd.arg(format!("-DateTimeOriginal={}", formatted_date));
                cmd.arg(format!("-CreateDate={}", formatted_date));
            }
        }

        // 单帧特定信息
        if let Some(aperture) = &task.aperture {
            if !aperture.is_empty() {
                cmd.arg(format!("-FNumber={}", aperture));
            }
        }

        if let Some(shutter) = &task.shutter_speed {
            if !shutter.is_empty() {
                cmd.arg(format!("-ExposureTime={}", shutter));
            }
        }

        if let Some(notes) = &task.notes {
            if !notes.is_empty() {
                cmd.arg(format!("-ImageDescription={}", notes));
            }
        }

        cmd.arg(&task.file_path);

        match cmd.output() {
            Ok(output) => {
                if output.status.success() {
                    results.push(ProcessResult {
                        success: true,
                        file_path: task.file_path,
                        error_message: None,
                    });
                } else {
                    let err = String::from_utf8_lossy(&output.stderr).to_string();
                    results.push(ProcessResult {
                        success: false,
                        file_path: task.file_path,
                        error_message: Some(err),
                    });
                }
            }
            Err(e) => {
                results.push(ProcessResult {
                    success: false,
                    file_path: task.file_path,
                    error_message: Some(format!("Failed to execute exiftool: {}", e)),
                });
            }
        }
    }

    Ok(results)
}

