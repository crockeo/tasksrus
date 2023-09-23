#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod database;

use crate::database::Database;
use crate::database::Task;
use database::TaskID;
use serde::Deserialize;
use tauri::InvokeError;
use tauri::State;

fn main() -> anyhow::Result<()> {
    let current_dir = std::env::current_dir()?;
    println!("{:?}", current_dir);

    let database = Database::open(current_dir.join("database.sqlite"))?;
    tauri::Builder::default()
        .manage(database)
        .invoke_handler(tauri::generate_handler![
            get_tasks_for_view,
            get_root_tasks,
            new_task,
            get_task,
        ])
        .run(tauri::generate_context!())?;

    Ok(())
}

#[derive(Deserialize)]
pub enum View {
    Inbox,
    Today,
    Upcoming,
    Anytime,
    Someday,
    Logbook,
}

#[tauri::command]
fn get_tasks_for_view(database: State<Database>, view: View) -> Result<Vec<Task>, Error> {
    use View::*;
    Ok(match view {
        Inbox => database.inbox(),
        Today => database.today(),
        Upcoming => database.upcoming(),
        Anytime => database.anytime(),
        Someday => database.someday(),
        Logbook => database.logbook(),
    }?)
}

#[tauri::command]
fn get_root_tasks(database: State<Database>) -> Result<Vec<Task>, Error> {
    Ok(database.root_tasks()?)
}

#[tauri::command]
fn new_task(database: State<Database>) -> Result<Task, Error> {
    Ok(database.new_task()?)
}

#[tauri::command]
fn get_task(database: State<Database>, id: TaskID) -> Result<Task, Error> {
    Ok(database.get_task(id)?)
}

pub enum Error {
    Anyhow(anyhow::Error),
}

impl From<anyhow::Error> for Error {
    fn from(value: anyhow::Error) -> Self {
        Self::Anyhow(value)
    }
}

impl Into<InvokeError> for Error {
    fn into(self) -> InvokeError {
        use Error::*;
        match self {
            Anyhow(err) => InvokeError::from_anyhow(err),
        }
    }
}
