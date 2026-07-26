use tauri::AppHandle;

pub async fn init_database(app: &AppHandle) -> Result<(), String> {
    let db = tauri_plugin_sql::Builder::default()
        .build("sqlite:moyue.db".to_string(), app);
    
    db.execute(
        "CREATE TABLE IF NOT EXISTS books (id TEXT PRIMARY KEY, title TEXT NOT NULL, author TEXT, file_path TEXT NOT NULL, file_type TEXT NOT NULL, file_size INTEGER, total_words INTEGER, current_position INTEGER DEFAULT 0, current_chapter INTEGER DEFAULT 0, last_read_at TEXT, created_at TEXT, tags TEXT, rating INTEGER DEFAULT 0, description TEXT)",
        vec![],
    )
    .await
    .map_err(|e| format!("创建 books 表失败: {}", e))?;
    
    db.execute(
        "CREATE TABLE IF NOT EXISTS book_progress (book_id TEXT PRIMARY KEY, position INTEGER DEFAULT 0, chapter INTEGER DEFAULT 0, last_read_at TEXT, FOREIGN KEY (book_id) REFERENCES books(id))",
        vec![],
    )
    .await
    .map_err(|e| format!("创建 book_progress 表失败: {}", e))?;
    
    db.execute(
        "CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, book_id TEXT NOT NULL, chapter_id TEXT, position INTEGER, selected_text TEXT, content TEXT, color TEXT DEFAULT '#fef3c7', created_at TEXT, updated_at TEXT, FOREIGN KEY (book_id) REFERENCES books(id))",
        vec![],
    )
    .await
    .map_err(|e| format!("创建 notes 表失败: {}", e))?;
    
    db.execute(
        "CREATE TABLE IF NOT EXISTS bookmarks (id TEXT PRIMARY KEY, book_id TEXT NOT NULL, position INTEGER, chapter_title TEXT, created_at TEXT, FOREIGN KEY (book_id) REFERENCES books(id))",
        vec![],
    )
    .await
    .map_err(|e| format!("创建 bookmarks 表失败: {}", e))?;
    
    db.execute(
        "CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT)",
        vec![],
    )
    .await
    .map_err(|e| format!("创建 app_settings 表失败: {}", e))?;
    
    Ok(())
}
