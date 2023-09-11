import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [tasks, setTasks] = useState([]);

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
      <div className="taskList">
	<div className="title">Tasks</div>

	<div>
	  {tasks.map((task, i) =>
	    <Task task={task} />
	  )}
	</div>

	<div>
	  +
	</div>
      </div>

      <div className="taskContent">
	blah
      </div>
    </div>
  );
}

export default App;
