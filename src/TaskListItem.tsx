import { useState } from "react";
import classNames from "classnames";

import { Task } from "./types.ts";

export interface ITaskListItemProps {
  task: Task,
  onClick: (e) => any,
}

function TaskListItem(props: ITaskListItemProps) {
  let [checked, setChecked] = useState(false);

  let title = props.task.title;
  if (title == "") {
    title = "New Task";
  }

  return (
    <div className="flex item-center py-1">
      <input className="checkbox" type="checkbox" onClick={(e) => setChecked(e.target.checked)} checked={checked} />
      <span className="mx-1"></span>
      <span
        className={classNames({
          "text-stone-500": checked,
          "line-through": checked,
          "text-stone-400": !props.task.title,
        })}
      >
        {props.task.title != "" ? title : "New Task"}
      </span>
    </div>
  );
}

export default TaskListItem;
