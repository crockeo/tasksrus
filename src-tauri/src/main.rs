#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod database;

use crate::database::MemoryDatabase;
use crate::database::Task;
use crate::database::TaskDatabase;
use crate::database::TaskID;

type Database = MemoryDatabase;

fn main() {
    tauri::Builder::default()
        .manage(Database::new())
        .invoke_handler(tauri::generate_handler![
            get_category_tasks,
            get_task,
            get_tasks,
            new_task,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn get_category_tasks(state: tauri::State<Database>) -> Vec<Task> {
    state.inner().root_tasks().unwrap()
}

#[tauri::command]
fn get_task(state: tauri::State<Database>, task_id: TaskID) -> Task {
    state.inner().get_task(task_id).unwrap()
}

#[tauri::command]
fn get_tasks(state: tauri::State<Database>) -> Vec<Task> {
    state.inner().root_tasks().unwrap()
}

#[tauri::command]
fn new_task(state: tauri::State<Database>) -> Task {
    state.inner().new_task().unwrap()
}
