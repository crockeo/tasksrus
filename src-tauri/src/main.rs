#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod database;

use crate::database::MemoryDatabase;
use crate::database::Task;
use crate::database::TaskDatabase;
use crate::database::TaskID;
use serde::Deserialize;
use tauri::InvokeError;
use thiserror::Error;

type Database = MemoryDatabase;

fn main() {
    tauri::Builder::default()
        .manage(Database::new())
        .invoke_handler(tauri::generate_handler![
            get_tasks_for_mode,
            get_root_tasks,
            get_task,
            get_tasks,
            new_task,
            update_task,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn get_tasks_for_mode(
    state: tauri::State<Database>,
    mode: Mode,
) -> Result<Vec<Task>, Error> {
    println!("{:?}", mode);
    Ok(vec![])
}

#[tauri::command]
fn get_root_tasks(state: tauri::State<Database>) -> Result<Vec<Task>, Error> {
    Ok(state.inner().root_tasks()?)
}

#[derive(Debug, Deserialize)]
enum Mode {
    Inbox,
    Today,
    Upcoming,
    Anytime,
    Someday,
    Logbook,
    Trash,
}

#[derive(Debug, Error)]
enum Error {
    #[error("An error occurred")]
    AnyhowError(String),
}

impl From<anyhow::Error> for Error {
    fn from(value: anyhow::Error) -> Self {
        Self::AnyhowError(value.to_string())
    }
}

impl Into<InvokeError> for Error {
    fn into(self) -> InvokeError {
        todo!()
    }
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

#[tauri::command]
fn update_task(state: tauri::State<Database>, task: Task) {
    state.update_task(&task).expect("Failed to update task...")
}
