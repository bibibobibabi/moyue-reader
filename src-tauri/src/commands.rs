use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use chardetng::EncodingDetector;

#[derive(Serialize, Deserialize, Debug)]
pub struct ExportData {
    pub books: Vec<serde_json::Value>,
    pub notes: Vec<serde_json::Value>,
    pub bookmarks: Vec<serde_json::Value>,
    pub settings: serde_json::Value,
}

#[tauri::command]
pub async fn read_text_file(file_path: String) -> Result<String
