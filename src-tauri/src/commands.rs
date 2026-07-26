use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use tauri::AppHandle;
use chardetng::EncodingDetector;

#[derive(Serialize, Deserialize, Debug)]
pub struct BookProgress {
    pub book_id: String,
    pub position: i64,
    pub chapter: i64,
    pub last_read_at: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ExportData {
    pub books: Vec<serde_json::Value>,
    pub notes: Vec<serde_json::Value>,
    pub bookmarks: Vec<serde_json::Value>,
    pub settings: serde_json::Value,
}

#[tauri::command]
pub async fn read_text_file(file_path: String) -> Result<String, String> {
    let bytes = fs::read(&file_path).map_err(|e| format!("读取文件失败: {}", e))?;
    decode_bytes(&bytes)
}

#[tauri::command]
pub async fn decode_text_file(bytes: Vec<u8>) -> Result<String, String> {
    decode_bytes(&bytes)
}

fn decode_bytes(bytes: &[u8]) -> Result<String, String> {
    if bytes.starts_with(&[0xEF, 0xBB, 0xBF]) {
        return String::from_utf8(bytes[3..].to_vec())
            .map_err(|e| format!("UTF-8 解码失败: {}", e));
    }
    if let Ok(text) = String::from_utf8(bytes.to_vec()) {
        return Ok(text);
    }
    let mut detector = EncodingDetector::new();
    detector.feed(bytes, true);
    let (encoding, _, _) = detector.guess(None, true);
    let (cow, _, had_errors) = encoding.decode(bytes);
    if had_errors {
        let (cow, _, _) = encoding_rs::GBK.decode(bytes);
        Ok(cow.into_owned())
    } else {
        Ok(cow.into_owned())
    }
}

#[tauri::command]
pub async fn extract_pdf_text(file_path: String) -> Result<String, String> {
    let path = Path::new(&file_path);
    let text = pdf_extract::extract_text(path)
        .map_err(|e| format!("PDF 提取失败: {}", e))?;
    Ok(text)
}

#[tauri::command]
pub async fn save_book_progress(app: AppHandle, progress: BookProgress) -> Result<(), String> {
    let db = tauri_plugin_sql::Builder::default()
        .build("sqlite:moyue.db".to_string(), &app)
        .map_err(|e| e.to_string())?;
    db.execute(
        "INSERT OR REPLACE INTO book_progress (book_id, position, chapter, last_read_at) VALUES (?1, ?2, ?3, ?4)",
        vec![progress.book_id.into(), progress.position.into(), progress.chapter.into(), progress.last_read_at.into()],
    ).await.map_err(|e| format!("保存进度失败: {}", e))?;
    Ok(())
}

#[tauri::command]
pub async fn load_book_progress(app: AppHandle, book_id: String) -> Result<Option<BookProgress>, String> {
    let db = tauri_plugin_sql::Builder::default()
        .build("sqlite:moyue.db".to_string(), &app)
        .map_err(|e| e.to_string())?;
    let rows: Vec<BookProgress> = db.select(
        "SELECT book_id, position, chapter, last_read_at FROM book_progress WHERE book_id = ?1",
        vec![book_id.into()],
    ).await.map_err(|e| format!("查询失败: {}", e))?;
    Ok(rows.into_iter().next())
}

#[tauri::command]
pub async fn export_data(file_path: String, data: ExportData) -> Result<(), String> {
    let json = serde_json::to_string_pretty(&data).map_err(|e| format!("序列化失败: {}", e))?;
    fs::write(&file_path, json).map_err(|e| format!("写入文件失败: {}", e))?;
    Ok(())
}

#[tauri::command]
pub async fn import_data(file_path: String) -> Result<ExportData, String> {
    let content = fs::read_to_string(&file_path).map_err(|e| format!("读取文件失败: {}", e))?;
    let data: ExportData = serde_json::from_str(&content).map_err(|e| format!("解析 JSON 失败: {}", e))?;
    Ok(data)
}

#[tauri::command]
pub async fn get_system_fonts() -> Result<Vec<String>, String> {
    let mut fonts = Vec::new();
    #[cfg(target_os = "windows")]
    {
        if let Ok(entries) = fs::read_dir("C:\\Windows\\Fonts") {
            for entry in entries.flatten() {
                if let Some(name) = entry.file_name().to_str() {
                    if name.ends_with(".ttf") || name.ends_with(".otf") || name.ends_with(".ttc") {
                        fonts.push(name.to_string());
                    }
                }
            }
        }
    }
    fonts.sort();
    fonts.dedup();
    Ok(fonts)
}
