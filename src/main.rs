#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod database;

use crate::database::MemoryDatabase;

static mut DATABASE: Option<MemoryDatabase> = None;

fn main() {
    unsafe {
        // This runs first, and is the only place that we touch `DATABASE` mutably.
        // I'm sure that there's a better way, but I'll deal with it later.
        DATABASE.replace(database::MemoryDatabase::new());
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
