use anyhow::anyhow;
use chrono::Local;
use chrono::NaiveDate;
use rusqlite::Connection;
use rusqlite::Row;
use std::path::Path;
use std::str::FromStr;
use std::sync::Mutex;

pub type TaskID = i64;

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Task {
    id: TaskID,
    pub title: String,
    pub description: String,
    pub scheduled: Scheduled,
    pub completed: Option<NaiveDate>,
}

impl Task {
    fn from_rows(mut rows: rusqlite::Rows<'_>) -> anyhow::Result<Vec<Self>> {
        let mut tasks = vec![];
        while let Some(row) = rows.next()? {
            tasks.push(Self::from_row(row)?);
        }
        Ok(tasks)
    }

    fn from_row(row: &Row<'_>) -> anyhow::Result<Self> {
        let scheduled_str: String = row.get("scheduled")?;
        let scheduled = Scheduled::from_str(&scheduled_str)?;

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

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Scheduled {
    Anytime,
    Someday,
    Day(NaiveDate),
}

impl FromStr for Scheduled {
    type Err = anyhow::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        use Scheduled::*;
        Ok(match s {
            "anytime" => Anytime,
            "someday" => Someday,
            iso_8601 => Scheduled::Day(NaiveDate::parse_from_str(iso_8601, ISO_8601_FMT)?),
        })
    }
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

    pub fn get_task(&self, id: TaskID) -> anyhow::Result<Task> {
        let conn = self.conn.lock().unwrap();

        let mut statement = conn.prepare("SELECT * FROM tasks WHERE id = ?")?;
        let rows = statement.query((id,))?;

        while let Some(row) = rows.next()? {
            return Task::from_row(row);
        }

        return Err(anyhow!("No such task with ID: {}", id));
    }

    pub fn update_task(&self, task: &Task) -> anyhow::Result<()> {
        let conn = self.conn.lock().unwrap();

        let mut statement = conn.prepare(include_str!("sql/queries/update_task.sql"))?;
        statement.execute((
            &task.title,
            &task.description,
            task.scheduled.to_string(),
            task.completed.map(|c| c.format(ISO_8601_FMT).to_string()),
            task.id,
        ))?;

        Ok(())
    }

    pub fn link(&self, from: &Task, to: &Task) -> anyhow::Result<()> {
        let conn = self.conn.lock().unwrap();

        let mut statement = conn.prepare(include_str!("sql/queries/link.sql"))?;
        statement.execute((from.id, to.id))?;

        Ok(())
    }

    pub fn unlink(&self, from: &Task, to: &Task) -> anyhow::Result<()> {
        let conn = self.conn.lock().unwrap();

        let mut statement = conn.prepare(include_str!("sql/queries/unlink.sql"))?;
        statement.execute((from.id, to.id))?;

        Ok(())
    }

    pub fn inbox(&self) -> anyhow::Result<Vec<Task>> {
        let conn = self.conn.lock().unwrap();

        let mut statement = conn.prepare(include_str!("sql/queries/inbox.sql"))?;
        let rows = statement.query(())?;

        Task::from_rows(rows)
    }

    pub fn today(&self) -> anyhow::Result<Vec<Task>> {
        let conn = self.conn.lock().unwrap();

        let mut statement = conn.prepare(include_str!("sql/queries/today.sql"))?;
        let rows = statement.query((today().format(ISO_8601_FMT).to_string(),))?;

        Task::from_rows(rows)
    }

    pub fn upcoming(&self) -> anyhow::Result<Vec<Task>> {
        let conn = self.conn.lock().unwrap();

        let mut statement = conn.prepare(include_str!("sql/queries/upcoming.sql"))?;
        let rows = statement.query((today().format(ISO_8601_FMT).to_string(),))?;

        Task::from_rows(rows)
    }

    pub fn anytime(&self) -> anyhow::Result<Vec<Task>> {
        let conn = self.conn.lock().unwrap();

        let mut statement = conn.prepare(include_str!("sql/queries/anytime.sql"))?;
        let rows = statement.query(())?;

        Task::from_rows(rows)
    }

    pub fn someday(&self) -> anyhow::Result<Vec<Task>> {
        let conn = self.conn.lock().unwrap();

        let mut statement = conn.prepare(include_str!("sql/queries/someday.sql"))?;
        let rows = statement.query(())?;

        Task::from_rows(rows)
    }

    pub fn logbook(&self) -> anyhow::Result<Vec<Task>> {
        let conn = self.conn.lock().unwrap();

        let mut statement = conn.prepare(include_str!("sql/queries/logbook.sql"))?;
        let rows = statement.query(())?;

        Task::from_rows(rows)
    }

    pub fn root_tasks(&self) -> anyhow::Result<Vec<Task>> {
        let conn = self.conn.lock().unwrap();

        let mut statement = conn.prepare(
            "SELECT * FROM tasks WHERE NOT EXISTS (SELECT * FROM links WHERE links.to_id = tasks.id)",
        )?;
        let rows = statement.query(())?;

        Task::from_rows(rows)
    }

    pub fn parents(&self, task: &Task) -> anyhow::Result<Vec<Task>> {
        let conn = self.conn.lock().unwrap();

        let mut statement = conn.prepare(
            "SELECT tasks.* FROM tasks INNER JOIN links ON links.to_id = tasks.id",
        )?;
        let rows = statement.query(())?;

        Task::from_rows(rows)
    }

    pub fn children(&self, task: &Task) -> anyhow::Result<Vec<Task>> {
        let conn = self.conn.lock().unwrap();

        let mut statement = conn.prepare(
            "SELECT tasks.* FROM tasks INNER JOIN links ON links.from_id = tasks.id",
        )?;
        let rows = statement.query(())?;

        Task::from_rows(rows)
    }

    pub fn search(&self, token: &str) -> anyhow::Result<Vec<Task>> {
        todo!()
    }
}

const ISO_8601_FMT: &'static str = "%Y-%m-%d";

fn today() -> NaiveDate {
    Local::now().naive_local().date()
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
    fn test_get_task() -> anyhow::Result<()> {
        let temp_database = TempDatabase::new()?;
        let database = temp_database.database();

        let task = database.new_task()?;
        let retrieved_task = database.get_task(task.id)?;
        assert_eq!(task, retrieved_task);
        Ok(())
    }

    #[test]
    fn test_inbox() -> anyhow::Result<()> {
        let temp_database = TempDatabase::new()?;
        let database = temp_database.database();

        let task = database.new_task()?;
        let inbox_tasks = database.inbox()?;

        assert_eq!(inbox_tasks.len(), 1);
        assert_eq!(task, inbox_tasks[0]);
        Ok(())
    }

    #[test]
    fn test_today() -> anyhow::Result<()> {
        let temp_database = TempDatabase::new()?;
        let database = temp_database.database();

        let mut task = database.new_task()?;
        task.scheduled = Scheduled::Day(today());
        database.update_task(&task)?;

        let today_tasks = database.today()?;
        assert_eq!(today_tasks.len(), 1);
        assert_eq!(task, today_tasks[0]);

        Ok(())
    }

    #[test]
    fn test_upcoming() -> anyhow::Result<()> {
        let temp_database = TempDatabase::new()?;
        let database = temp_database.database();

        let mut task = database.new_task()?;
        task.scheduled = Scheduled::Day(today() + chrono::Days::new(1));
        database.update_task(&task)?;

        {
            let mut someday_task = database.new_task()?;
            someday_task.scheduled = Scheduled::Someday;
            database.update_task(&someday_task)?;
        }

        let upcoming_tasks = database.upcoming()?;
        assert_eq!(upcoming_tasks.len(), 1);
        assert_eq!(task, upcoming_tasks[0]);

        Ok(())
    }

    #[test]
    fn test_anytime() -> anyhow::Result<()> {
        let temp_database = TempDatabase::new()?;
        let database = temp_database.database();

        let parent_task = database.new_task()?;
        let child_task = database.new_task()?;
        database.link(&parent_task, &child_task)?;

        let anytime_tasks = database.anytime()?;
        assert_eq!(anytime_tasks.len(), 1);
        assert_eq!(child_task, anytime_tasks[0]);

        Ok(())
    }

    #[test]
    fn test_someday() -> anyhow::Result<()> {
        let temp_database = TempDatabase::new()?;
        let database = temp_database.database();

        let mut task = database.new_task()?;
        task.scheduled = Scheduled::Someday;
        database.update_task(&task)?;

        let someday_tasks = database.someday()?;
        assert_eq!(someday_tasks.len(), 1);
        assert_eq!(task, someday_tasks[0]);

        Ok(())
    }

    #[test]
    fn test_logbook() -> anyhow::Result<()> {
        let temp_database = TempDatabase::new()?;
        let database = temp_database.database();

        let mut task = database.new_task()?;
        task.completed = Some(today());
        database.update_task(&task)?;

        let logbook_tasks = database.logbook()?;
        assert_eq!(logbook_tasks.len(), 1);
        assert_eq!(task, logbook_tasks[0]);

        Ok(())
    }

    #[test]
    fn test_root_tasks() -> anyhow::Result<()> {
        let temp_database = TempDatabase::new()?;
        let database = temp_database.database();

        let root_task_0 = database.new_task()?;
        let root_task_1 = database.new_task()?;
        let child_task = database.new_task()?;
        database.link(&root_task_0, &child_task)?;

        let root_tasks = database.root_tasks()?;
        assert_eq!(root_tasks.len(), 2);
        assert_eq!(root_task_0, root_tasks[0]);
        assert_eq!(root_task_1, root_tasks[1]);

        Ok(())
    }
}
