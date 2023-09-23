use chrono::Local;
use chrono::NaiveDate;
use rusqlite::Connection;
use rusqlite::Row;
use std::path::Path;
use std::sync::Mutex;

#[derive(Debug, Eq, PartialEq)]
pub struct Task {
    id: i64,
    pub title: String,
    pub description: String,
    pub scheduled: Scheduled,
    pub completed: Option<NaiveDate>,
}

impl Task {
    fn extract_from_row(row: &Row<'_>) -> anyhow::Result<Self> {
        let scheduled_str: String = row.get("scheduled")?;
        let scheduled = match scheduled_str.as_str() {
            "anytime" => Scheduled::Anytime,
            "someday" => Scheduled::Someday,
            s => Scheduled::Day(NaiveDate::parse_from_str(s, ISO_8601_FMT)?),
        };

        let completed_str: Option<String> = row.get("completed")?;
        let completed: Option<NaiveDate> = if let Some(completed_str) = completed_str {
            Some(NaiveDate::parse_from_str(&completed_str, ISO_8601_FMT)?)
        } else {
            None
        };


        Ok(Self {
            id: row.get("id")?,
            title: row.get("title")?,
            description: row.get("description")?,
            scheduled,
            completed,
        })
    }
}

#[derive(Debug, Eq, PartialEq)]
pub enum Scheduled {
    Anytime,
    Someday,
    Day(NaiveDate),
}

impl ToString for Scheduled {
    fn to_string(&self) -> String {
        use Scheduled::*;
        match self {
            Anytime => "anytime".into(),
            Someday => "someday".into(),
            Day(date) => date.format("%Y-%m-%d").to_string(),
        }
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
            scheduled: Scheduled::Anytime,
            completed: None,
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

        let mut statement = conn.prepare(include_str!("sql/queries/upcoming.sql"))?;
        let mut rows = statement.query((today_iso_8601(),))?;

        let mut tasks = vec![];
        while let Some(row) = rows.next()? {
            tasks.push(Task::extract_from_row(row)?);
        }

        Ok(tasks)
    }

    pub fn anytime(&self) -> anyhow::Result<Vec<Task>> {
        let conn = self.conn.lock().unwrap();

        let mut statement = conn.prepare(include_str!("sql/queries/anytime.sql"))?;
        let mut rows = statement.query(())?;

        let mut tasks = vec![];
        while let Some(row) = rows.next()? {
            tasks.push(Task::extract_from_row(row)?);
        }

        Ok(tasks)
    }

    pub fn someday(&self) -> anyhow::Result<Vec<Task>> {
        let conn = self.conn.lock().unwrap();

        let mut statement = conn.prepare(include_str!("sql/queries/someday.sql"))?;
        let mut rows = statement.query(())?;

        let mut tasks = vec![];
        while let Some(row) = rows.next()? {
            tasks.push(Task::extract_from_row(row)?);
        }

        Ok(tasks)
    }

    pub fn logbook(&self) -> anyhow::Result<Vec<Task>> {
        let conn = self.conn.lock().unwrap();

        let mut statement = conn.prepare(include_str!("sql/queries/logbook.sql"))?;
        let mut rows = statement.query(())?;

        let mut tasks = vec![];
        while let Some(row) = rows.next()? {
            tasks.push(Task::extract_from_row(row)?);
        }

        Ok(tasks)
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

const ISO_8601_FMT: &'static str = "%Y-%m-%d";

fn today_iso_8601() -> String {
    let today = Local::now().naive_local().date();
    let today_iso_8601 = today.format(ISO_8601_FMT).to_string();
    today_iso_8601
}

#[cfg(test)]
mod tests {
    use super::*;

    use tempdir::TempDir;

    struct TempDatabase {
        temp_dir: TempDir,
        database_handle: Database,
    }

    impl TempDatabase {
        fn new() -> anyhow::Result<Self> {
            let temp_dir = TempDir::new("tasksrus-database-test")?;
            let database = Database::open(temp_dir.path().join("database.sqlite"))?;
            Ok(Self {
                temp_dir,
                database_handle: database,
            })
        }

        fn database(&self) -> &Database {
            &self.database_handle
        }
    }

    #[test]
    fn test_new_task() -> anyhow::Result<()> {
        let temp_database = TempDatabase::new()?;
        let task = temp_database.database().new_task()?;
        assert_eq!(
            task,
            Task {
                id: 1,
                title: "".into(),
                description: "".into(),
                scheduled: Scheduled::Anytime,
                completed: None,
            },
        );
        Ok(())
    }

    #[test]
    fn test_inbox() -> anyhow::Result<()> {
        let temp_database = TempDatabase::new()?;
        let task = temp_database.database().new_task()?;
        let inbox_tasks = temp_database.database().inbox()?;

        assert_eq!(inbox_tasks.len(), 1);
        assert_eq!(task, inbox_tasks[0]);
        Ok(())
    }
}
