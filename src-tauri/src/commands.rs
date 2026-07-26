// src-tauri/src/commands.rs

/// 获取系统字体列表（供前端调用）
#[tauri::command]
pub fn get_system_fonts() -> Result<Vec<String>, String> {
    // 暂时返回空列表，保证编译通过
    // 后续你可以在这里写真正的系统字体获取逻辑
    Ok(vec![])
}
