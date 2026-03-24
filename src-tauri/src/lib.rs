use tauri::Builder;

mod commands;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::fs_handler::scan_directory,
            commands::fs_handler::convert_bmp_to_tiff,
            commands::exif_engine::write_exif_batch
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

