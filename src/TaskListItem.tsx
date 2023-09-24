import React, { useState } from "react";
import classNames from "classnames";

import { Task } from "./types.ts";

export interface ITaskListItemProps {
  task: Task,
  onChecked: (checked: boolean) => any,
  onClick: (evt: React.MouseEvent<HTMLSpanElement>) => any,
}

function TaskListItem(props: ITaskListItemProps) {
  let [checked, setCheckedRaw] = useState(false);
  function setChecked(checked: boolean) {
    setCheckedRaw(checked);
    props.onChecked(checked);
  }

  let title = props.task.title;
  if (title == "") {
    title = "New Task";
  }

  return (
    <div className="flex items-center py-1">
      <input className="checkbox checkbox-sm" type="checkbox" onChange={(e) => setChecked(e.target.checked)} checked={checked} />
      <span className="mx-1"></span>
      <span
        className={classNames({
          "text-stone-500": checked,
          "line-through": checked,
          "text-stone-400": !props.task.title,
        })}
        onClick={(evt) => props.onClick(evt)}
      >
        {props.task.title != "" ? title : "New Task"}
      </span>
    </div>
  );
}

export default TaskListItem;
