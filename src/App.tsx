import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import classNames from "classnames";
import { useDebounce } from "usehooks-ts";

import "./App.css";
import reactLogo from "./assets/react.svg";
import { Task, Mode, View, isMode } from "./types.ts";
import TaskView from "./TaskView.tsx";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    (async () => {
      setTasks(await invoke("get_root_tasks"));
    })();
  }, []);

  const [currentView, setCurrentView] = useState(Mode.Inbox);

  async function newTask() {
    setTasks([
      ...tasks,
      await invoke("new_task"),
    ]);
  }

  return (
    <div className="container">
      <div className="side-bar">
        <Category mode={Mode.Inbox} currentView={currentView} setCurrentView={setCurrentView} />

        <div className="space-small"></div>

        <Category mode={Mode.Today} currentView={currentView} setCurrentView={setCurrentView} />
        <Category mode={Mode.Upcoming} currentView={currentView} setCurrentView={setCurrentView} />
        <Category mode={Mode.Anytime} currentView={currentView} setCurrentView={setCurrentView} />
        <Category mode={Mode.Someday} currentView={currentView} setCurrentView={setCurrentView} />

        <div className="space-small"></div>

        <Category mode={Mode.Logbook} currentView={currentView} setCurrentView={setCurrentView} />
        <Category mode={Mode.Trash} currentView={currentView} setCurrentView={setCurrentView} />

        <div className="space-small"></div>

        <div className="task-list">
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
        <MainView view={currentView} />
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
        : "Untitled Task"}
    </div>
  );
}

interface IMainViewProps {
  view: View,
}

function MainView(props: IMainViewProps) {
  let [tasks, setTasks] = useState(null);
  let [task, setTask] = useState(null);

  useEffect(() => {
    console.log("reevaluating...");
    if (isMode(props.view)) {
      (async () => {
        setTasks(await invoke("get_tasks_for_view", {view: props.view}));
      })();
    } else {
      (async () => {
        setTask(await invoke("get_task", {id: props.view}));
      })();
    }
  }, [props.view]);

  useEffect(() => {
    if (task == null) {
      return;
    }
    (async () => {
      await invoke("update_task", {task: task});
    })();
  }, [task])

  function isLoading(): bool {
    if (isMode(props.view)) {
      return tasks == null;
    }
    return task == null;
  }

  if (isLoading()) {
    return <LoadingView />
  } else if (isMode(props.view)) {
    return <TaskListView tasks={tasks} />
  } else {
    return (
      <TaskView
        task={task}
        setTask={setTask}
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
  tasks: [Task],
}

function TaskListView(props: ITaskListViewProps) {
  return (
    <div>
      {props.tasks.map((task, i) =>
        <div key={i}>
          {JSON.stringify(task)}
        </div>
      )}
    </div>
  );
}

export default App;
