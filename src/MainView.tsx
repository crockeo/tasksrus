import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

import TaskListItem from "./TaskListItem.tsx";
import TaskView from "./TaskView.tsx";
import { GetTaskResponse, Task, Mode, View, isMode } from "./types.ts";
import { getIconForMode } from "./icons.tsx";

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

  useEffect(() => {
    if (taskResponse == null) {
      return;
    }
    (async () => {
      props.updateTask(taskResponse.task);
      await invoke("update_task", {task: taskResponse.task});
    })();
  }, [taskResponse])

  let view;
  if (isMode(props.view) && tasks != null) {
    let mode = props.view as Mode;
    view = <TaskListView mode={mode} tasks={tasks} setCurrentView={(_) => { /*TODO*/ }}/>
  } else if (taskResponse != null) {
    view = (
      <TaskView
        task={taskResponse.task}
        children={taskResponse.children}
        parents={taskResponse.parents}
        setTask={(task: Task) => {
          if (taskResponse == null) { return; }
          setTaskResponse({
            ...taskResponse,
            task: task,
          })}
        }
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
  tasks: [Task],
  setCurrentView: (view: View) => any,
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
        {props.tasks.map((task, i) =>
          <TaskListItem
            key={i}
            task={task}
            onChecked={(_) => {}}
            onClick={(_) => props.setCurrentView(task.id)}
          />
        )}
      </div>
    </div>
  );
}

export default MainView;
