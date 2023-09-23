import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import classNames from "classnames";
import { useDebounce } from "usehooks-ts";

import "./App.css";
import reactLogo from "./assets/react.svg";


interface Task {
  id: number,
  title: string,
  description: string,
  scheduled: string,
  completed: string | null,
}

enum Mode {
  Inbox = "Inbox",
  Today = "Today",
  Upcoming = "Upcoming",
  Anytime = "Anytime",
  Someday = "Someday",
  Logbook = "Logbook",
  Trash = "Trash",
}

type View = Mode | number;

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
  const [contents, setContents] = useState(null);

  async function newTask() {
    setTasks([
      ...tasks,
      await invoke("new_task"),
    ]);
  }

  useEffect(() => {
    setContents(null);

    switch (currentView) {
    case Mode.Inbox:
    case Mode.Today:
    case Mode.Upcoming:
    case Mode.Anytime:
    case Mode.Someday:
    case Mode.Logbook:
    case Mode.Trash:
      (async () => {
        setContents(await invoke("get_tasks_for_view", {view: currentView}));
      })();
      break;

    default:
      (async () => {
        setContents(await invoke("get_task", {id: currentView}));
      })();
      break;
    }

  }, [currentView])

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
        <MainView contents={contents} view={currentView} />
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

interface ITaskProps {
  task: Task,
  currentView: View,
  setCurrentView: (View) => void,
}

function CategoryTask(props: ITaskProps) {
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
  contents: Array<Task> | Task,
  view: View,
}

function MainView(props: IMainViewProps) {
  if (props.contents == null) {
    return <LoadingView />
  } else if (Array.isArray(props.contents)) {
    return <TaskListView tasks={props.contents} view={props.view} />
  } else if (typeof props.contents == "object") {
    return <TaskView task={props.contents} />
  } else {
    throw Exception("cannot render for unknown type: " + typeof props.contents);
  }
}

function LoadingView() {
  return (
    <div>...</div>
  );
}

interface ITaskListViewProps {
  tasks: [Task],
  view: View,
}

function TaskListView(props: ITaskListViewProps) {
  return (
    <div>
      <div>{ props.view }</div>
      <div>Tasks</div>
    </div>
  );
}

interface ITaskViewProps {
  task: Task,
}

function TaskView(props: ITaskViewProps) {
  const [title, setTitle] = useState(props.task.title);
  const debouncedTitle = useDebounce(title, 250);

  useEffect(() => {
    props.task.title = debouncedTitle;
    invoke("update_task", {task: props.task});
  }, [debouncedTitle]);

  return (
    <div className="task-view">
      <input
        className="title-input"
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter task title" value={title}
      />

      <div>{ props.task.id }</div>
      <div>{ props.task.title }</div>
    </div>
  );
}

export default App;
