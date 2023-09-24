import classNames from "classnames";

import { Task } from "./types.ts";

export interface ITaskListItemProps {
  task: Task,
  onClick: (e) => any,
}

function TaskListItem(props: ITaskListItemProps) {
  let title = props.task.title;
  if (title == "") {
    title = "New Task";
  }

  return (
    <div>
      <span
        className={classNames({
          "text-stone-400": !props.task.title,
        })}
      >
        {props.task.title != "" ? title : "New Task"}
      </span>
    </div>
  );
}

export default TaskListItem;
