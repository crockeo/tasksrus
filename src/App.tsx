import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { invoke } from "@tauri-apps/api/tauri";
import classNames from "classnames";
import { useDebounce } from "usehooks-ts";

import "./App.css";
import reactLogo from "./assets/react.svg";
import { Task, Mode, View, isMode } from "./types.ts";
import SearchView from "./SearchView.tsx";
import TaskView from "./TaskView.tsx";
import TaskListItem from "./TaskListItem.tsx";

function App() {
  const [searchShown, setSearchShown] = useState(false);
  useHotkeys(["mod+k"], () => { setSearchShown(true) });

  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    (async () => {
      setTasks(await invoke("get_root_tasks"));
    })();
  }, []);

  function updateTask(task: Task) {
    let i;
    for (i = 0; i < tasks.length; i++) {
      if (task.id == tasks[i].id) {
        break;
      }
    }
    if (i == tasks.length) {
      // That means we're editing a task which is not present in the task list,
      // so we don't need to update it.
      return;
    }

    setTasks([
      ...tasks.slice(0, i),
      task,
      ...tasks.slice(i + 1, tasks.length),
    ]);
  }

  updateTask({});

  const [currentView, setCurrentView] = useState(Mode.Inbox);

  async function newTask() {
    setTasks([
      ...tasks,
      await invoke("new_task"),
    ]);
  }

  return (
    <div className="container">
      <SearchView shown={searchShown} setShown={setSearchShown} />

      <div className="side-bar">
        <Category mode={Mode.Inbox} currentView={currentView} setCurrentView={setCurrentView} />

        <div className="space-small"></div>

        <Category mode={Mode.Today} currentView={currentView} setCurrentView={setCurrentView} />
        <Category mode={Mode.Upcoming} currentView={currentView} setCurrentView={setCurrentView} />
        <Category mode={Mode.Anytime} currentView={currentView} setCurrentView={setCurrentView} />
        <Category mode={Mode.Someday} currentView={currentView} setCurrentView={setCurrentView} />

        <div className="space-small"></div>

        <Category mode={Mode.Logbook} currentView={currentView} setCurrentView={setCurrentView} />
        { /* <Category mode={Mode.Trash} currentView={currentView} setCurrentView={setCurrentView} /> */ }

        <div className="space-small"></div>

        <div className="side-task-list">
          {tasks.map((task) =>
            <CategoryTask
              key={task.id}
              task={task}
              currentView={currentView}
              setCurrentView={setCurrentView}
            />
          )}
        </div>

        <div className="space-small"></div>

        <div className="side-bar-bottom-bar">
          <div>{""}</div>
          <button className="add-task-button" onClick={newTask}>+</button>
        </div>
      </div>

      <div className="main-view">
        <MainView updateTask={updateTask} view={currentView} />
      </div>
    </div>
  );
}

interface ICategoryProps {
  mode: Mode,
  currentView: View,
  setCurrentView: (View) => void,
}

function Category(props: ICategoryProps) {
  return (
    <div
      className={
        classNames("category", "task", {
          "task-selected": props.currentView == props.mode
        })
      }
      onClick={(_) => props.setCurrentView(props.mode)}
    >
      {props.mode}
    </div>
  );
}

interface ICategoryTaskProps {
  task: Task,
  currentView: View,
  setCurrentView: (View) => void,
}

function CategoryTask(props: ICategoryTaskProps) {
  // TODO: this text is not 100% centered in its block.
  // why is that? do we have to tune something about where the text sits relative to its "line"?
  return (
    <div
      className={
        classNames("task", {
          "task-empty-title": props.task.title.length == 0,
          "task-selected": props.currentView == props.task.id,
        })
      }
      onClick={(_) => {
        props.setCurrentView(props.task.id)
      }}
    >
      {props.task.title.length > 0
        ? props.task.title
        : "New Task"}
    </div>
  );
}

interface IMainViewProps {
  updateTask: (Task) => any,
  view: View,
}

function MainView(props: IMainViewProps) {
  let [tasks, setTasks] = useState(null);
  let [taskResponse, setTaskResponse] = useState(null);

  useEffect(() => {
    if (isMode(props.view)) {
      (async () => {
        setTasks(await invoke("get_tasks_for_view", {view: props.view}));
      })();
    } else {
      (async () => {
        setTaskResponse(await invoke("get_task", {id: props.view}));
      })();
    }
  }, [props.view]);

  useEffect(() => {
    if (taskResponse == null) {
      return;
    }
    (async () => {
      props.updateTask(taskResponse.task);
      await invoke("update_task", {task: taskResponse.task});
    })();
  }, [taskResponse])

  function isLoading(): bool {
    if (isMode(props.view)) {
      return tasks == null;
    }
    return taskResponse == null;
  }

  if (isLoading()) {
    return <LoadingView />
  } else if (isMode(props.view)) {
    return <TaskListView mode={props.view} tasks={tasks} />
  } else {
    return (
      <TaskView
        task={taskResponse.task}
        children={taskResponse.children}
        parents={taskResponse.parents}
        setTask={(task) => setTaskResponse({
          ...taskResponse,
          task: task,
        })}
      />
    );
  }
}

function LoadingView() {
  return (
    <div>...</div>
  );
}

interface ITaskListViewProps {
  mode: Mode,
  tasks: [Task],
  setCurrentView: (View) => any,
}

function TaskListView(props: ITaskListViewProps) {
  return (
    <div className="task-list">
      <div className="task-list-title">{props.mode}</div>

      <div className="task-list-tasks">
        {props.tasks.map((task, i) =>
          <TaskListItem
            key={i}
            task={task}
            onClick={(_) => props.setCurrentView(task.id)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
