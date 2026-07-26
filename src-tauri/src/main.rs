#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod db;

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let app_handle = app.handle();
            tauri::async_runtime::block_on(async {
                if let Err(e) = db::init_database(app_handle).await {
                    eprintln!("数据库初始化失败: {}", e);
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::read_text_file,
            commands::decode_text_file,
            commands::extract_pdf_text,
            commands::save_book_progress,
            commands::load_book_progress,
            commands::export_data,
            commands::import_data,
            commands::get_system_fonts,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
