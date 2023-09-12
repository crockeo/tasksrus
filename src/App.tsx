import { useState } from "react";
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

type View = Mode | string;

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  const [currentView, setCurrentView] = useState(Mode.Inbox);
  const [tasks, setTasks] = useState([
    {
      inner_id: 12341,
      title: "Work on tasksrus",
    },
    {
      inner_id: 518283,
      title: "Also do my job lol",
    },
  ]);

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name }));
  }

  async function getTasks() {
    console.log("Hello world!");
    setTasks(await invoke("get_tasks"));
    console.log(tasks);
  }

  return (
    <div className="container">
      <div className="task-list">
	<div>
          <div className="title">Tasks</div>

          <div className="space-medium"></div>

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

          <div>
            {tasks.map((task) =>
              <Task
		key={task.inner_id}
		task={task}
		currentView={currentView}
		setCurrentView={setCurrentView}
	      />
            )}
          </div>
	</div>

	<div>
          +
	</div>
      </div>

      <div className="task-content">
	blah
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

function Task(props: ITaskProps) {
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
	console.log(props.currentView);
	props.setCurrentView(props.task.inner_id)
      }}
    >
      {props.task.title}
    </div>
  );
}

export default App;
