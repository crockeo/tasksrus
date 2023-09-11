import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import classNames from "classnames";

interface Task {
  inner_id: number
  title: string
}

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  const [currentTask, setCurrentTask] = useState(0);
  const [tasks, setTasks] = useState([
    {
      inner_id: 0,
      title: "Work on tasksrus",
    },
    {
      inner_id: 1,
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

	  <div className="subtitle">Inbox</div>

	  <div className="space-small"></div>

	  <div className="subtitle">Upcoming</div>
	  <div className="subtitle">Anytime</div>
	  <div className="subtitle">Someday</div>

	  <div className="space-small"></div>

	  <div className="subtitle">Logbook</div>
	  <div className="subtitle">Trash</div>

	  <div className="space-medium"></div>

	  <div>
	    {tasks.map((task) =>
	      <Task key={task.inner_id} selected={currentTask == task.inner_id} task={task} />
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

interface ITaskProps {
  selected: bool,
  task: Task,
}

function Task(props: ITaskProps) {
  // TODO: this text is not 100% centered in its block.
  // why is that? do we have to tune something about where the text sits relative to its "line"?
  return (
    <div className={classNames("task", {
      "task-selected": props.selected,
    })}>
      {props.task.title}
    </div>
  );
}

export default App;
