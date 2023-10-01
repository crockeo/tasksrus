import classNames from "classnames";
import { useEffect, useState } from "react";

import { Task, Mode, View, isMode } from "./types.ts";
import { getIconForMode } from "./icons.tsx";
import { iso8601Now } from "./utils.ts";
import { useHotkeys } from "react-hotkeys-hook";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import Button from "./Button.tsx";
import TextArea from "./components/TextArea.tsx";

export interface IMainViewProps {
  newTask: () => any;
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
        newTask={props.newTask}
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
  newTask: () => any;
  setView: (view: View) => any;
  tasks: Task[];
  updateTask: (task: Task) => any;
}

function TaskListView(props: ITaskListViewProps) {
  const [selected, setSelected] = useState(null as number | null);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    setSelected(null);
    setOpened(false);
  }, [props.mode]);

  useHotkeys("escape", () => {
    if (opened) {
      setOpened(false);
      return;
    }
    if (selected != null) {
      setSelected(null);
      return;
    }
  });

  useHotkeys("enter", () => {
    if (selected == null) {
      return;
    }
    setOpened(!opened);
  });

  useHotkeys(["up", "shift+tab"], () => {
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

    setOpened(false);
    setSelected(selected - 1);
  });

  useHotkeys(["down", "tab"], () => {
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

    setOpened(false);
    setSelected(selected + 1);
  });

  useHotkeys("mod+k", () => {
    if (selected == null) {
      return;
    }
    let task = props.tasks[selected];
    if (task.completed) {
      task = { ...task, completed: null };
    } else {
      task = { ...task, completed: iso8601Now() };
    }
    props.updateTask(task);
  });

  useHotkeys("mod+backspace", () => {
    if (selected == null) {
      return;
    }
    let task = {
      ...props.tasks[selected],
      deleted: iso8601Now(),
    };
    props.updateTask(task);
  });

  useHotkeys("mod+n", props.newTask);

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
            key={task.id}
            onClick={(evt) => {
              evt.stopPropagation();
              setSelected(i);
            }}
            selected={(() => {
              if (selected == i && opened) {
                return SelectedState.Opened;
              }
              if (selected == i) {
                return SelectedState.Selected;
              }
              return SelectedState.None;
            })()}
            setView={props.setView}
            task={task}
            updateTask={props.updateTask}
          />
        ))}
      </div>
    </div>
  );
}

enum SelectedState {
  None,
  Selected,
  Opened,
}

interface ITaskListItemProps {
  onClick: (evt: React.MouseEvent<HTMLSpanElement>) => any;
  selected: SelectedState;
  setView: (view: View) => any;
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
        checked={props.task.completed != null}
      />
      <span className="mx-1"></span>
    </>
  );

  let title;
  if (props.selected == SelectedState.Opened) {
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
    "border-stone-800",
    "px-2",
    "py-1",
    "my-1",
    "rounded",
  );
  if (props.selected == SelectedState.Opened) {
    className = classNames(className, "border-stone-600", "shadow-xl");
  } else if (props.selected == SelectedState.Selected) {
    className = classNames(className, "bg-sky-800", "border-sky-800");
  } else {
    className = classNames(
      className,
      "active:bg-sky-800",
      "border-transparent",
      "cursor-default",
      "hover:border-sky-800",
    );
  }

  return (
    <div className={className} onClick={(evt) => props.onClick(evt)}>
      <div className="flex flex-row items-center">
        {checkbox}
        {title}
      </div>

      {props.selected == SelectedState.Opened ? (
        <TaskListItemBody
          setView={props.setView}
          task={props.task}
          updateTask={props.updateTask}
        />
      ) : (
        <></>
      )}
    </div>
  );
}

interface ITaskListItemBodyProps {
  setView: (view: View) => any;
  task: Task;
  updateTask: (task: Task) => any;
}

function TaskListItemBody(props: ITaskListItemBodyProps) {
  // TODO: complete this list!
  // also it's showing Someday for the inbox tasks,
  // but they should be inbox.
  // need to get parent/child information
  let mode;
  if (props.task.completed != null) {
    mode = Mode.Logbook;
  } else if (props.task.scheduled == Mode.Anytime) {
    mode = Mode.Anytime;
  } else if (props.task.scheduled == Mode.Someday) {
    mode = Mode.Someday;
  } else {
    mode = Mode.Inbox;
  }

  return (
    <div className="flex flex-col py-2">
      <TextArea
        className="bg-transparent grow p-1 rounded focus:outline-none"
        placeholder="Description"
        onChange={(evt) =>
          props.updateTask({ ...props.task, description: evt.target.value })
        }
        value={props.task.description}
      ></TextArea>

      <div className="my-1"></div>

      <div className="flex">
        <div className="flex items-center">
          <span className="inline-block w-4 h-4">{getIconForMode(mode)}</span>
          <span className="mx-1"></span>
          <span className="font-semibold inline">{mode}</span>
        </div>

        <div className="grow"></div>

        <Button onClick={(_) => props.setView(props.task.id)}>
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>
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
