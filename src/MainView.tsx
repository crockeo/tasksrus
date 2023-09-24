import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import classNames from "classnames";

import TaskView from "./TaskView.tsx";
import { GetTaskResponse, Task, Mode, View, isMode } from "./types.ts";
import { getIconForMode } from "./icons.tsx";
import { iso8601Now } from "./utils.ts";

export interface IMainViewProps {
  updateTask: (task: Task) => any,
  view: View,
}

function MainView(props: IMainViewProps) {
  let [tasks, setTasks] = useState(null);
  let [taskResponse, setTaskResponse] = useState(null as GetTaskResponse | null);

  useEffect(() => {
    if (isMode(props.view)) {
      (async () => {
        setTasks(await invoke("get_tasks_for_view", {view: props.view}));
      })();
    } else {
      (async () => {
        setTaskResponse(await invoke("get_task", {id: props.view}));
      })();
    }
  }, [props.view]);

  function setTask(task: Task) {
    if (taskResponse == null) {
      return;
    }
    setTaskResponse({
      ...taskResponse,
      task: task,
    });
    props.updateTask(task);
  }

  let view;
  if (isMode(props.view) && tasks != null) {
    let mode = props.view as Mode;
    view = (
      <TaskListView
        mode={mode}
        setCurrentView={(_) => { /*TODO*/ }}
        tasks={tasks}
        updateTask={props.updateTask}
      />
    );
  } else if (taskResponse != null) {
    view = (
      <TaskView
        task={taskResponse.task}
        children={taskResponse.children}
        parents={taskResponse.parents}
        setTask={setTask}
      />
    );
  } else {
    view = <LoadingView />;
  }

  return (
    <div className="flex flex-col h-full mx-auto w-3/4">
      {view}
    </div>
  );
}

function LoadingView() {
  return (
    <div>...</div>
  );
}

interface ITaskListViewProps {
  mode: Mode,
  setCurrentView: (view: View) => any,
  tasks: [Task],
  updateTask: (task: Task) => any,
}

function TaskListView(props: ITaskListViewProps) {
  function completeTask(task: Task, completed: boolean) {
    if (completed) {
      task.completed = iso8601Now();
    } else {
      task.completed = null;
    }
    props.updateTask(task);
  }

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
        {props.tasks.map((task, i) =>
          <TaskListItem
            key={i}
            task={task}
            onChecked={(checked) => completeTask(task, checked)}
            onClick={(_) => props.setCurrentView(task.id)}
          />
        )}
      </div>
    </div>
  );
}

interface ITaskListItemProps {
  task: Task,
  onChecked: (checked: boolean) => any,
  onClick: (evt: React.MouseEvent<HTMLSpanElement>) => any,
}

function TaskListItem(props: ITaskListItemProps) {
  let [checked, setCheckedRaw] = useState(!!props.task.completed);
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

export default MainView;
