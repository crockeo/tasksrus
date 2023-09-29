import classNames from "classnames";

import TaskView from "./TaskView.tsx";
import { Task, Mode, View, isMode } from "./types.ts";
import { getIconForMode } from "./icons.tsx";
import { iso8601Now } from "./utils.ts";

export interface IMainViewProps {
  tasks: Task[];
  updateTask: (task: Task) => any;
  view: View;
}

function MainView(props: IMainViewProps) {
  let view;
  if (props.tasks == null) {
    view = <LoadingView />;
  } else if (isMode(props.view)) {
    let mode = props.view as Mode;
    view = (
      <TaskListView
        mode={mode}
        setCurrentView={(_) => {
          /*TODO*/
        }}
        tasks={props.tasks}
        updateTask={props.updateTask}
      />
    );
  } else {
    view = (
      <TaskView
        children={[]}
        parents={[]}
        task={props.tasks[0]}
        updateTask={props.updateTask}
      />
    );
  }

  return <div className="flex flex-col h-full mx-auto w-3/4">{view}</div>;
}

function LoadingView() {
  return <div>...</div>;
}

interface ITaskListViewProps {
  mode: Mode;
  setCurrentView: (view: View) => any;
  tasks: Task[];
  updateTask: (task: Task) => any;
}

function TaskListView(props: ITaskListViewProps) {
  return (
    <div className="flex-1 flex flex-col my-12 w-75 overflow-y-hidden">
      <div className="mb-8 flex items-center">
        <span className="inline-block w-7 h-7">
          {getIconForMode(props.mode)}
        </span>
        <span className="mx-1"></span>
        <span className="font-semibold text-3xl">{props.mode}</span>
      </div>

      <div className="overflow-y-scroll">
        {props.tasks.map((task, i) => (
          <TaskListItem
            key={i}
            task={task}
            updateTask={props.updateTask}
            onClick={(_) => props.setCurrentView(task.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface ITaskListItemProps {
  onClick: (evt: React.MouseEvent<HTMLSpanElement>) => any;
  task: Task;
  updateTask: (task: Task) => any;
}

function TaskListItem(props: ITaskListItemProps) {
  function setChecked(checked: boolean) {
    let task = { ...props.task };
    if (checked) {
      task.completed = iso8601Now();
    } else {
      task.completed = null;
    }
    props.updateTask(task);
  }

  let title = props.task.title;
  if (title == "") {
    title = "New Task";
  }

  let checked = props.task.completed != null;
  return (
    <div className="flex items-center py-1">
      <input
        className="checkbox checkbox-sm"
        type="checkbox"
        onChange={(e) => setChecked(e.target.checked)}
        checked={checked}
      />
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

export default MainView;
