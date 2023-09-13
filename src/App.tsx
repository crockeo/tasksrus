import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import classNames from "classnames";

interface Task {
  inner_id: number
  title: string
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
  async function getCategoryTasks() {
    setTasks(await invoke("get_category_tasks"));
  }

  const [currentView, setCurrentView] = useState(Mode.Inbox);
  const [contents, setContents] = useState(null);

  async function getTasks() {
    setContents(await invoke("get_tasks", { view: currentView }));
  }

  async function getTask() {
    setContents(await invoke("get_task", { taskId: currentView }));
  }

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
      getTasks()
      break;

    default:
      getTask()
      break;
    }

  }, [currentView])

  useEffect(() => { getCategoryTasks() }, []);

  return (
    <div className="container">
      <div className="side-bar">
	<div>
	  <Category mode={Mode.Inbox} currentView={currentView} setCurrentView={setCurrentView} />

          <div className="space-small"></div>

	  <Category mode={Mode.Today} currentView={currentView} setCurrentView={setCurrentView} />
	  <Category mode={Mode.Upcoming} currentView={currentView} setCurrentView={setCurrentView} />
	  <Category mode={Mode.Anytime} currentView={currentView} setCurrentView={setCurrentView} />
	  <Category mode={Mode.Someday} currentView={currentView} setCurrentView={setCurrentView} />

          <div className="space-small"></div>

	  <Category mode={Mode.Logbook} currentView={currentView} setCurrentView={setCurrentView} />
	  <Category mode={Mode.Trash} currentView={currentView} setCurrentView={setCurrentView} />

          <div className="space-medium"></div>

	  {/* TODO: make this fill only the available screen space, no matter the size of other elements */}
          <div className="task-list">
            {tasks.map((task) =>
              <CategoryTask
		key={task.inner_id}
		task={task}
		currentView={currentView}
		setCurrentView={setCurrentView}
	      />
            )}
          </div>
	</div>

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
	  "task-selected": props.currentView == props.task.inner_id,
	})
      }
      onClick={(_) => {
	props.setCurrentView(props.task.inner_id)
      }}
    >
      {props.task.title.length > 0
	? props.task.title
	: "Untitled Task"}
    </div>
  );
}

interface IMainViewProps {
}

function MainView(props: IMainViewProps) {
  if (props.contents == null) {
    return <LoadingView />
  } else if (Array.isArray(props.contents)) {
    return <TaskListView tasks={props.contents} />
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
}

function TaskListView(props: ITaskListViewProps) {
  return (
    <div>Tasks</div>
  );
}

interface ITaskViewProps {
  task: Task,
}

function TaskView(props: ITaskViewProps) {
  return (
    <div>
      <div>{ props.task.inner_id }</div>
      <div>{ props.task.title }</div>
    </div>
  );
}

export default App;
