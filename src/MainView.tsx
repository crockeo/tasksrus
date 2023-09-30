import classNames from "classnames";
import { useState } from "react";

import { Task, Mode, View, isMode } from "./types.ts";
import { getIconForMode } from "./icons.tsx";
import { iso8601Now } from "./utils.ts";
import { useHotkeys } from "react-hotkeys-hook";

export interface IMainViewProps {
  setView: (view: View) => any;
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
        setView={props.setView}
        tasks={props.tasks}
        updateTask={props.updateTask}
      />
    );
  } else {
    view = <TaskView task={props.tasks[0]} updateTask={props.updateTask} />;
  }

  return <div className="flex flex-col h-full mx-auto w-3/4">{view}</div>;
}

function LoadingView() {
  return <div>...</div>;
}

interface ITaskListViewProps {
  mode: Mode;
  setView: (view: View) => any;
  tasks: Task[];
  updateTask: (task: Task) => any;
}

function TaskListView(props: ITaskListViewProps) {
  const [selected, setSelected] = useState(null as number | null);

  useHotkeys(["escape", "enter"], () => {
    setSelected(null);
  });

  useHotkeys("up", () => {
    if (props.tasks.length == 0) {
      return;
    }

    if (selected == 0) {
      return;
    }

    if (selected == null) {
      setSelected(props.tasks.length - 1);
      return;
    }

    setSelected(selected - 1);
  });

  useHotkeys("down", () => {
    if (props.tasks.length == 0) {
      return;
    }

    if (selected == props.tasks.length - 1) {
      return;
    }

    if (selected == null) {
      setSelected(0);
      return;
    }

    setSelected(selected + 1);
  });

  return (
    <div
      className={classNames(
        "flex-1 flex flex-col my-12 w-75 overflow-y-hidden",
        "transition",
        {
          "bg-stone-850": selected != null,
        },
      )}
      onClick={(_) => setSelected(null)}
    >
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
            onClick={(evt) => {
              evt.stopPropagation();
              setSelected(i);
            }}
            selected={selected == i}
            task={task}
            updateTask={props.updateTask}
          />
        ))}
      </div>
    </div>
  );
}

interface ITaskListItemProps {
  onClick: (evt: React.MouseEvent<HTMLSpanElement>) => any;
  selected: boolean;
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

  let checked = props.task.completed != null;

  let checkbox = (
    <>
      <input
        className="checkbox checkbox-sm"
        type="checkbox"
        onChange={(e) => setChecked(e.target.checked)}
      />
      <span className="mx-1"></span>
    </>
  );

  let title;
  if (props.selected) {
    title = (
      <input
        className="bg-transparent grow focus:outline-none"
        onChange={(e) =>
          props.updateTask({
            ...props.task,
            title: e.target.value,
          })
        }
        placeholder="New Task"
        value={props.task.title}
      />
    );
  } else {
    title = (
      <span
        className={classNames({
          "text-stone-500": checked,
          "line-through": checked,
          "text-stone-400": !props.task.title,
        })}
      >
        {!!props.task.title ? props.task.title : "New Task"}
      </span>
    );
  }

  let className = classNames(
    "border",
    "border-stone-600",
    "px-2",
    "py-1",
    "my-1",
    "rounded",
    "transition-all",
  );
  if (props.selected) {
    className = classNames(className, "bg-stone-600", "shadow-lg");
  } else {
    className = classNames(
      className,
      "active:bg-stone-600",
      "border-transparent",
      "cursor-default",
      "hover:border-stone-600",
    );
  }

  return (
    <div className={className} onClick={(evt) => props.onClick(evt)}>
      <div className="flex flex-row items-center">
        {checkbox}
        {title}
      </div>

      {props.selected ? (
        <TaskListItemBody task={props.task} updateTask={props.updateTask} />
      ) : (
        <></>
      )}
    </div>
  );
}

interface ITaskListItemBodyProps {
  task: Task;
  updateTask: (task: Task) => any;
}

function TaskListItemBody(props: ITaskListItemBodyProps) {
  return (
    <div className="flex pt-2 pb-1">
      <textarea
        className="grow p-1 rounded focus:outline-none"
        onChange={(evt) =>
          props.updateTask({ ...props.task, description: evt.target.value })
        }
        value={props.task.description}
      ></textarea>
    </div>
  );
}

interface ITaskViewProps {
  task: Task;
  updateTask: (task: Task) => any;
}

function TaskView(props: ITaskViewProps) {
  return (
    <div className="flex-1 flex flex-col my-12 w-75 overflow-y-hidden">
      <input
        className="bg-transparent font-bold mb-8 text-3xl"
        onChange={(e) =>
          props.updateTask({
            ...props.task,
            title: e.target.value,
          })
        }
        placeholder="New Task"
        value={props.task.title}
      />

      <textarea
        className="description-input"
        onChange={(e) =>
          props.updateTask({
            ...props.task,
            description: e.target.value,
          })
        }
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

export default MainView;
