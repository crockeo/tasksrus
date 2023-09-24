import { Task } from "./types.ts";
import "./TaskListItem.css";

export interface ITaskListItemProps {
  task: Task,
  onClick: (e) => any,
}

function TaskListItem(props: ITaskListItemProps) {
  return (
    <div>
      <div className="task-title">{props.task.title}</div>
    </div>
  );
}

export default TaskListItem;
