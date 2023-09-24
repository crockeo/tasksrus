import classNames from "classnames";
import { PlusIcon } from "@heroicons/react/24/solid";
import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import Button from "./Button.tsx";
import SearchView from "./SearchView.tsx";
import TaskListItem from "./TaskListItem.tsx";
import TaskView from "./TaskView.tsx";
import { Task, Mode, View, isMode } from "./types.ts";
import { getIconForMode } from "./icons.tsx";

function App() {
  const [searchShown, setSearchShown] = useState(false);
  useHotkeys(["mod+k"], () => { setSearchShown(true) });

  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    (async () => {
      setTasks(await invoke("get_root_tasks"));
    })();
  }, []);

  function updateTask(task: Task) {
    let i;
    for (i = 0; i < tasks.length; i++) {
      if (task.id == tasks[i].id) {
        break;
      }
    }
    if (i == tasks.length) {
      // That means we're editing a task which is not present in the task list,
      // so we don't need to update it.
      return;
    }

    setTasks([
      ...tasks.slice(0, i),
      task,
      ...tasks.slice(i + 1, tasks.length),
    ]);
  }

  updateTask({});

  const [currentView, setCurrentView] = useState(Mode.Inbox);

  async function newTask() {
    setTasks([
      ...tasks,
      await invoke("new_task"),
    ]);
  }

  return (
    <div className="grid grid-cols-5 w-screen h-screen text-base text-stone-100 overflow-y-hidden">
      <SearchView shown={searchShown} setShown={setSearchShown} />

      <div className="flex flex-col bg-stone-800 col-span-1 h-screen">
        <div className="flex-1 flex flex-col overflow-y-hidden px-3 py-5">
          <div>
            <Category mode={Mode.Inbox} currentView={currentView} setCurrentView={setCurrentView} />

            <div className="my-3"></div>

            <Category mode={Mode.Today} currentView={currentView} setCurrentView={setCurrentView} />
            <Category mode={Mode.Upcoming} currentView={currentView} setCurrentView={setCurrentView} />
            <Category mode={Mode.Anytime} currentView={currentView} setCurrentView={setCurrentView} />
            <Category mode={Mode.Someday} currentView={currentView} setCurrentView={setCurrentView} />

            <div className="my-3"></div>

            <Category mode={Mode.Logbook} currentView={currentView} setCurrentView={setCurrentView} />
            <Category mode={Mode.Trash} currentView={currentView} setCurrentView={setCurrentView} />

            <div className="my-3"></div>
          </div>

          <div className="overflow-y-scroll">
            {tasks.map((task) =>
              <CategoryTask
                key={task.id}
                task={task}
                currentView={currentView}
                setCurrentView={setCurrentView}
              />
            )}
          </div>
        </div>

        <div className="border-t border-stone-900 p-2">
          <Button onClick={newTask}>
            <span className="inline-block"><PlusIcon className="w-4 h-4" /></span>
            <span className="mx-0.5"></span>
            <span className="inline">New Task</span>
          </Button>
        </div>
      </div>

      <div className="bg-stone-700 col-span-4">
        <div className="mx-auto w-3/4">
          <MainView updateTask={updateTask} view={currentView} />
        </div>
      </div>
    </div>
  );
}

interface ICategoryProps {
  mode: Mode,
  currentView: View,
  setCurrentView: (View) => void,
}

function Category(props: ICategoryProps) {
  let icon = getIconForMode(props.mode);
  return (
    <div
      className={
        classNames(
          "cursor-default",
          "flex",
          "font-medium",
          "items-center",
          "px-2",
          "py-0.5",
          "rounded",
          "select-none",
          {
            "bg-stone-700": props.currentView == props.mode,
          },
        )
      }
      onClick={(_) => props.setCurrentView(props.mode)}
    >
      <span className="inline-block w-4 h-4">{icon}</span>
      <span className="m-1"></span>
      <span>{props.mode}</span>
    </div>
  );
}

interface ICategoryTaskProps {
  task: Task,
  currentView: View,
  setCurrentView: (View) => void,
}

function CategoryTask(props: ICategoryTaskProps) {
  // TODO: this text is not 100% centered in its block.
  // why is that? do we have to tune something about where the text sits relative to its "line"?
  return (
    <div
      className={
        classNames(
          "cursor-default",
          "font-medium",
          "px-2",
          "py-0.5",
          "rounded",
          "select-none",
          {
            "bg-stone-700": props.currentView == props.task.id,
            "text-stone-400": !props.task.title,
          },
        )
      }
      onClick={(_) => {
        props.setCurrentView(props.task.id)
      }}
    >
      {props.task.title.length > 0
        ? props.task.title
        : "New Task"}
    </div>
  );
}

interface IMainViewProps {
  updateTask: (Task) => any,
  view: View,
}

function MainView(props: IMainViewProps) {
  let [tasks, setTasks] = useState(null);
  let [taskResponse, setTaskResponse] = useState(null);

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

  function isLoading(): bool {
    if (isMode(props.view)) {
      return tasks == null;
    }
    return taskResponse == null;
  }

  if (isLoading()) {
    return <LoadingView />
  } else if (isMode(props.view)) {
    return <TaskListView mode={props.view} tasks={tasks} />
  } else {
    return (
      <TaskView
        task={taskResponse.task}
        children={taskResponse.children}
        parents={taskResponse.parents}
        setTask={(task) => setTaskResponse({
          ...taskResponse,
          task: task,
        })}
      />
    );
  }
}

function LoadingView() {
  return (
    <div>...</div>
  );
}

interface ITaskListViewProps {
  mode: Mode,
  tasks: [Task],
  setCurrentView: (View) => any,
}

function TaskListView(props: ITaskListViewProps) {
  return (
    <div className="my-12 w-75 mx-auto">
      <div className="mb-8 flex items-center">
        <span className="inline-block w-7 h-7">
          {getIconForMode(props.mode)}
        </span>
        <span className="mx-1"></span>
        <span className="font-semibold text-3xl">{props.mode}</span>
      </div>

      <div className="task-list-tasks">
        {props.tasks.map((task, i) =>
          <TaskListItem
            key={i}
            task={task}
            onClick={(_) => props.setCurrentView(task.id)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
