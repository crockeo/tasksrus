import React, { useState } from "react";
import classNames from "classnames";

import { Task } from "./types.ts";

export interface ITaskListItemProps {
  task: Task,
  onClick: (evt: React.ClickEvent<HTMLInputEvent>) => any,
  setChecked: (checked: bool) => any,
}

function TaskListItem(props: ITaskListItemProps) {
  let [checked, setCheckedRaw] = useState(false);
  function setChecked(checked: bool) {
    setCheckedRaw(checked);
    props.setChecked(checked);
  }

  let title = props.task.title;
  if (title == "") {
    title = "New Task";
  }

  return (
    <div className="flex items-center py-1">
      <input className="checkbox checkbox-sm" type="checkbox" onClick={(e) => setChecked(e.target.checked)} checked={checked} />
      <span className="mx-1"></span>
      <span
        className={classNames({
          "text-stone-500": checked,
          "line-through": checked,
          "text-stone-300": !props.task.title,
        })}
        onClick={() => props.onClick()}
      >
        {props.task.title != "" ? title : "New Task"}
      </span>
    </div>
  );
}

export default TaskListItem;
