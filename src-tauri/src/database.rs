use chrono::Local;
use chrono::NaiveDate;
use rusqlite::Connection;
use rusqlite::Row;
use std::path::Path;
use std::sync::Mutex;

pub struct Task {
    id: i64,
    pub title: String,
    pub description: String,
    pub scheduled: Option<NaiveDate>,
}

impl Task {
    fn extract_from_row(row: &Row<'_>) -> anyhow::Result<Self> {
        todo!()
    }
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
        let conn = self.conn.lock().unwrap();

        let mut statement = conn.prepare(include_str!("sql/queries/new_task.sql"))?;
        let id = statement.insert(())?;

        Ok(Task {
            id,
            title: "".into(),
            description: "".into(),
            scheduled: None,
        })
    }

    pub fn inbox(&self) -> anyhow::Result<Vec<Task>> {
        let conn = self.conn.lock().unwrap();

        let mut statement = conn.prepare(include_str!("sql/queries/inbox.sql"))?;
        let mut rows = statement.query(())?;

        let mut tasks = vec![];
        while let Some(row) = rows.next()? {
            tasks.push(Task::extract_from_row(row)?);
        }

        Ok(tasks)
    }

    pub fn today(&self) -> anyhow::Result<Vec<Task>> {
        let conn = self.conn.lock().unwrap();

        let mut statement = conn.prepare(include_str!("sql/queries/today.sql"))?;
        let mut rows = statement.query((today_iso_8601(),))?;

        let mut tasks = vec![];
        while let Some(row) = rows.next()? {
            tasks.push(Task::extract_from_row(row)?);
        }

        Ok(tasks)
    }

    pub fn upcoming(&self) -> anyhow::Result<Vec<Task>> {
        let conn = self.conn.lock().unwrap();

        let mut statement = conn.prepare(include_str!("sql/queries/today.sql"))?;
        let mut rows = statement.query((today_iso_8601(),))?;

        let mut tasks = vec![];
        while let Some(row) = rows.next()? {
            tasks.push(Task::extract_from_row(row)?);
        }

        Ok(tasks)
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

fn today_iso_8601() -> String {
    let today = Local::now().naive_local().date();
    let today_iso_8601 = today.format("%Y-%m-%d").to_string();
    today_iso_8601
}
