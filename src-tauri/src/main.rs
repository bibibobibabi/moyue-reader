// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// 注意：这里不要写 mod commands;
// 注意：这里不要写 #[tauri::command] fn get_system_fonts() ...
// 所有命令都定义在 lib.rs / commands.rs 里，这里只负责启动程序

fn main() {
    // 这个名字必须和 Cargo.toml 里的 [lib] name 一致
    // 我们下一步会把它设为 moyue_reader_lib
    moyue_reader_lib::run();
}
