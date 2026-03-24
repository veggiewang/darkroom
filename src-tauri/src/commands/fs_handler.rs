use serde::{Serialize, Deserialize};
use walkdir::WalkDir;
use std::path::Path;

#[derive(Serialize)]
pub struct ScanResult {
    pub files: Vec<ImageFile>,
}

#[derive(Serialize)]
pub struct ImageFile {
    pub path: String,
    pub name: String,
    pub format: String,
}

#[tauri::command]
pub fn scan_directory(path: &str) -> Result<ScanResult, String> {
    let mut files = Vec::new();
    
    // 支持的扩展名，加入 bmp
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
    
    // 简单按文件名排序
    files.sort_by(|a, b| a.name.cmp(&b.name));
    
    Ok(ScanResult { files })
}

