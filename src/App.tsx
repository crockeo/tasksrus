import classNames from "classnames";
import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import SideView from "./SideView.tsx";
import MainView from "./MainView.tsx";
import SearchView from "./SearchView.tsx";
import { Task, Mode, View } from "./types.ts";

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
    <div
      className={classNames(
        "grid",
        "grid-cols-5",
        "overflow-y-hidden",
        "text-base",
        "text-stone-100",
        "w-screen",
      )}
    >
      <SearchView shown={searchShown} setShown={setSearchShown} />

      <div className="bg-stone-900 col-span-1 h-screen">
        <SideView
          newTask={newTask}
          setView={setCurrentView}
          tasks={tasks}
          view={currentView}
        />
      </div>

      <div className="bg-stone-800 col-span-4 h-screen">
        <MainView updateTask={updateTask} view={currentView} />
      </div>
    </div>
  );
}
export default App;
