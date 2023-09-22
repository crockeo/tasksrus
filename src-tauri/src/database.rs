use anyhow::anyhow;
use serde::Deserialize;
use serde::Serialize;
use std::collections::BTreeMap;
use std::collections::BTreeSet;
use std::sync::Mutex;

pub type TaskID = usize;

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Task {
    inner_id: TaskID,
    pub title: String,
}

impl Task {
    pub fn id(&self) -> TaskID {
        self.inner_id
    }

    fn default_no_id() -> Self {
        Task {
            inner_id: 0,
            title: String::default(),
        }
    }
}

pub trait TaskDatabase: Send + Sync {
    fn new_task(&self) -> anyhow::Result<Task>;

    fn update_task(&self, task: &Task) -> anyhow::Result<()>;
    fn link_tasks(&self, from: &Task, to: &Task) -> anyhow::Result<()>;
    fn unlink_tasks(&self, from: &Task, to: &Task) -> anyhow::Result<()>;

    fn get_task(&self, id: TaskID) -> anyhow::Result<Task>;
    fn root_tasks(&self) -> anyhow::Result<Vec<Task>>;
    fn children_tasks(&self, task: &Task) -> anyhow::Result<Vec<Task>>;
}

#[derive(Default)]
struct TaskSet {
    tasks: BTreeMap<TaskID, Task>,
    links: BTreeMap<TaskID, BTreeSet<TaskID>>,
}

impl TaskSet {
    fn get_by_ids(&self, ids: &[TaskID]) -> anyhow::Result<Vec<Task>> {
        let mut tasks = Vec::new();
        for id in ids.iter() {
            if !self.tasks.contains_key(&id) {
                return Err(anyhow!("Database does not contain item: {}", id));
            }

            let task = self.tasks.get(id).unwrap();
            tasks.push(task.clone());
        }

        Ok(tasks)
    }
}

pub struct MemoryDatabase {
    task_set: Mutex<TaskSet>,
}

impl MemoryDatabase {
    pub fn new() -> Self {
        Self {
            task_set: Mutex::new(TaskSet::default()),
        }
    }
}

impl TaskDatabase for MemoryDatabase {
    fn new_task(&self) -> anyhow::Result<Task> {
        let mut task_set = self.task_set.lock().unwrap();

        let mut task = Task::default_no_id();
        task.inner_id = task_set.tasks.len();

        task_set.tasks.insert(task.inner_id, task.clone());
        Ok(task)
    }

    fn update_task(&self, task: &Task) -> anyhow::Result<()> {
        let mut task_set = self.task_set.lock().unwrap();

        if !task_set.tasks.contains_key(&task.id()) {
            return Err(anyhow!("Database does not contain task ID: {}", task.id()));
        }

        task_set.tasks.insert(task.id(), task.clone());
        Ok(())
    }

    fn link_tasks(&self, from: &Task, to: &Task) -> anyhow::Result<()> {
        let mut task_set = self.task_set.lock().unwrap();

        if !task_set.tasks.contains_key(&from.id()) {
            return Err(anyhow!(
                "Database does not contain from task ID: {}",
                from.id()
            ));
        }
        if !task_set.tasks.contains_key(&to.id()) {
            return Err(anyhow!("Database does not contain to task ID: {}", to.id()));
        }

        if !task_set.links.contains_key(&from.id()) {
            task_set.links.insert(from.id(), Default::default());
        }
        task_set.links.get_mut(&from.id()).unwrap().insert(to.id());
        Ok(())
    }

    fn unlink_tasks(&self, from: &Task, to: &Task) -> anyhow::Result<()> {
        let mut task_set = self.task_set.lock().unwrap();

        if !task_set.tasks.contains_key(&from.id()) {
            return Err(anyhow!(
                "Database does not contain from task ID: {}",
                from.id()
            ));
        }
        if !task_set.tasks.contains_key(&to.id()) {
            return Err(anyhow!("Database does not contain to task ID: {}", to.id()));
        }

        if !task_set.links.contains_key(&from.id()) {
            return Ok(());
        }
        task_set.links.get_mut(&from.id()).unwrap().remove(&to.id());
        Ok(())
    }

    fn get_task(&self, id: TaskID) -> anyhow::Result<Task> {
        let task_set = self.task_set.lock().unwrap();

        if !task_set.tasks.contains_key(&id) {
            return Err(anyhow!("Missing ID: {}", id));
        }

        Ok(task_set.tasks.get(&id).unwrap().clone())
    }

    fn root_tasks(&self) -> anyhow::Result<Vec<Task>> {
        let task_set = self.task_set.lock().unwrap();

        let mut ids = BTreeSet::new();
        for key in task_set.tasks.keys() {
            ids.insert(*key);
        }
        for children in task_set.links.values() {
            for key in children.iter() {
                ids.remove(key);
            }
        }
        let ids: Vec<TaskID> = ids.into_iter().collect();

        task_set.get_by_ids(&ids)
    }

    fn children_tasks(&self, task: &Task) -> anyhow::Result<Vec<Task>> {
        let task_set = self.task_set.lock().unwrap();

        let ids: Vec<TaskID> = task_set
            .links
            .get(&task.id())
            .unwrap()
            .into_iter()
            .cloned()
            .collect();
        task_set.get_by_ids(&ids)
    }
}
