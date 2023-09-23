use chrono::NaiveDate;
use rusqlite::Connection;
use std::path::Path;
use std::sync::Mutex;

pub struct Task {
    id: usize,
    pub title: String,
    pub description: String,
    pub scheduled: NaiveDate,
}

pub struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    pub fn open(path: impl AsRef<Path>) -> anyhow::Result<Self> {
        let database = Database {
            conn: Mutex::new(Connection::open(path)?),
        };
        database.migrate()?;
        Ok(database)
    }

    fn migrate(&self) -> anyhow::Result<()> {
        let conn = self.conn.lock().unwrap();
        let bootstrap = include_str!("sql/00_bootstrap.sql");
        conn.execute_batch(bootstrap)?;
        Ok(())
    }

    pub fn new_task(&self) -> anyhow::Result<Task> {
        todo!()
    }

    pub fn inbox(&self) -> anyhow::Result<Vec<Task>> {
        todo!()
    }

    pub fn today(&self) -> anyhow::Result<Vec<Task>> {
        todo!()
    }

    pub fn upcoming(&self) -> anyhow::Result<Vec<Task>> {
        todo!()
    }

    pub fn anytime(&self) -> anyhow::Result<Vec<Task>> {
        todo!()
    }

    pub fn someday(&self) -> anyhow::Result<Vec<Task>> {
        todo!()
    }

    pub fn logbook(&self) -> anyhow::Result<Vec<Task>> {
        todo!()
    }

    pub fn parents(&self, task: &Task) -> anyhow::Result<Vec<Task>> {
        todo!()
    }

    pub fn children(&self, task: &Task) -> anyhow::Result<Vec<Task>> {
        todo!()
    }

    pub fn search(&self, token: &str) -> anyhow::Result<Vec<Task>> {
        todo!()
    }
}
