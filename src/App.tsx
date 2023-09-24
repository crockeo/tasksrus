import classNames from "classnames";
import { PlusIcon } from "@heroicons/react/24/solid";
import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import Button from "./Button.tsx";
import MainView from "./MainView.tsx";
import SearchView from "./SearchView.tsx";
import { Task, Mode, View } from "./types.ts";
import { getIconForMode } from "./icons.tsx";

function App() {
  const [currentView, setCurrentView] = useState(Mode.Inbox as View);
  const [searchShown, setSearchShown] = useState(false);
  const [tasks, setTasks] = useState([] as Array<Task>);

  useHotkeys(["mod+k"], () => { setSearchShown(true) });

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

  async function newTask() {
    setTasks([
      ...tasks,
      await invoke("new_task"),
    ]);
  }

  return (
    <div className="grid grid-cols-5 w-screen h-screen text-base text-stone-100">
      <SearchView shown={searchShown} setShown={setSearchShown} />

      <div className="flex flex-col bg-stone-900 col-span-1 h-screen">
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

        <div className="border-t-2 border-stone-800 p-2">
          <Button onClick={newTask}>
            <span className="inline-block"><PlusIcon className="w-4 h-4" /></span>
            <span className="mx-0.5"></span>
            <span className="inline">New Task</span>
          </Button>
        </div>
      </div>

      <div className="bg-stone-800 col-span-4">
        <MainView updateTask={updateTask} view={currentView} />
      </div>
    </div>
  );
}

interface ICategoryProps {
  mode: Mode,
  currentView: View,
  setCurrentView: (view: View) => void,
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
  setCurrentView: (view: View) => void,
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

export default App;
