// src-tauri/src/lib.rs

// 声明 commands 模块（只在这里声明一次！）
pub mod commands;

// 导入 commands 里的所有公开函数
use commands::*;

// Android 移动端入口标记（必须加这个，否则 APK 打包失败）
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // 加载你项目用到的插件（根据 package.json 里的插件对应）
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        // 注册前端可调用的命令（只注册一次！）
        .invoke_handler(tauri::generate_handler![
            get_system_fonts,
            // 如果以后加了其他命令，在这里继续添加，比如：
            // open_file,
            // save_bookmark,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
