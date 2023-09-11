#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod database;

use crate::database::MemoryDatabase;
use crate::database::Task;
use crate::database::TaskDatabase;

type Database = MemoryDatabase;

fn main() {
    tauri::Builder::default()
        .manage(Database::new())
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![get_tasks])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_tasks(state: tauri::State<Database>) -> Vec<Task> {
    vec![state.inner().new_task().unwrap()]
}
