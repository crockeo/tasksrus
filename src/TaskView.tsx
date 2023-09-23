import { invoke } from "@tauri-apps/api/tauri";
import { useDebounce } from "usehooks-ts";
import { useEffect, useState } from "react";

import "./TaskView.css";
import { Task } from "./types.ts"

export interface ITaskViewProps {
  task: Task,
  children: [Task],
  parents: [Task],
  setTask: (Task) => any,
}

function TaskView(props: ITaskViewProps) {
  return (
    <div className="task-view">
      <input
        className="title-input"
        onChange={(e) => props.setTask({
          ...props.task,
          title: e.target.value,
        })}
        placeholder="New Task"
        value={props.task.title}
      />

      <div>
        {props.parents.map((parent, id) =>
          <div key={id}>
            {parent.title}
          </div>
        )}
      </div>

      <textarea
        className="description-input"
        onChange={(e) => props.setTask({
          ...props.task,
          description: e.target.value,
        })}
        placeholder="Notes"
        value={props.task.description}
      />

      <div className="time-zone">
        <div></div>
        <div>
          <span>{props.task.scheduled}</span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );
}

export default TaskView;
