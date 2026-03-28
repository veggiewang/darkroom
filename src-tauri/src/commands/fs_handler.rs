use serde::Serialize;
use walkdir::WalkDir;
use std::process::Command;

#[derive(Serialize)]
pub struct ScanResult {
    pub files: Vec<ImageFile>,
    pub bmp_count: usize,
}

#[derive(Serialize, Clone)]
pub struct ImageFile {
    pub path: String,
    pub name: String,
    pub format: String,
}

#[derive(Serialize)]
pub struct ConvertResult {
    pub success: usize,
    pub failed: usize,
    pub files: Vec<ImageFile>,
}

#[tauri::command]
pub fn scan_directory(path: &str) -> Result<ScanResult, String> {
    let mut files = Vec::new();
    
    let supported_exts = vec!["jpg", "jpeg", "tif", "tiff", "bmp"];
    
    for entry in WalkDir::new(path).into_iter().filter_map(|e| e.ok()) {
        let path = entry.path();
        
        if path.is_file() {
            if let Some(ext) = path.extension().and_then(|s| s.to_str()) {
                if supported_exts.contains(&ext.to_lowercase().as_str()) {
                    files.push(ImageFile {
                        path: path.to_string_lossy().to_string(),
                        name: path.file_name().unwrap().to_string_lossy().to_string(),
                        format: ext.to_lowercase(),
                    });
                }
            }
        }
    }
    
    files.sort_by(|a, b| a.name.cmp(&b.name));
    
    let bmp_count = files.iter().filter(|f| f.format == "bmp").count();
    
    Ok(ScanResult { files, bmp_count })
}

/// 使用 macOS 自带的 sips 将 BMP 转为 TIFF（原地替换）
#[tauri::command]
pub fn convert_bmp_to_tiff(bmp_paths: Vec<String>) -> Result<ConvertResult, String> {
    let mut success = 0;
    let mut failed = 0;
    let mut converted_files: Vec<ImageFile> = Vec::new();

    for bmp_path in &bmp_paths {
        let tiff_path = bmp_path
            .trim_end_matches(".bmp")
            .trim_end_matches(".BMP")
            .to_string() + ".tiff";

        // macOS 自带 sips，无需额外安装
        let result = Command::new("sips")
            .args(&["-s", "format", "tiff", bmp_path, "--out", &tiff_path])
            .output();

        match result {
            Ok(output) if output.status.success() => {
                // 删除原始 BMP
                let _ = std::fs::remove_file(bmp_path);
                let name = std::path::Path::new(&tiff_path)
                    .file_name()
                    .unwrap_or_default()
                    .to_string_lossy()
                    .to_string();
                converted_files.push(ImageFile {
                    path: tiff_path,
                    name,
                    format: "tiff".to_string(),
                });
                success += 1;
            }
            _ => {
                failed += 1;
            }
        }
    }

    Ok(ConvertResult { success, failed, files: converted_files })
}

