import classNames from "classnames";
import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import SideView from "./SideView.tsx";
import MainView from "./MainView.tsx";
import { Task, Mode, View, isMode } from "./types.ts";

/*

Keep all of the state top-level
- Current view
- Side bar tasks
- Current view tasks

Support events:

- Set current view
  - Fetch the contents of the new view
  - Then set the current view to be the new view AND set the current view tasks of the current view

- Update task

- Add task

And then pass allllll of this state down to the various components.

 */

function App() {
  const [view, rawSetView] = useState(Mode.Inbox as View);
  const [sideBarTasks, setSideBarTasks] = useState([] as Array<Task>);
  const [viewTasks, setViewTasks] = useState([] as Array<Task>);

  let order = [
    Mode.Inbox,
    Mode.Today,
    Mode.Upcoming,
    Mode.Anytime,
    Mode.Someday,
    Mode.Logbook,
    Mode.Trash,
  ];
  for (let i = 0; i < order.length; i++) {
    let mode = order[i];
    useHotkeys(`mod+${i + 1}`, () => setView(mode));
  }

  async function getTasksForView(view: View): Promise<Array<Task>> {
    if (isMode(view)) {
      return await invoke("get_tasks_for_view", { view: view });
    }
    return [await invoke("get_task", { id: view })];
  }

  async function setView(view: View) {
    let newViewTasks: Array<Task> = await getTasksForView(view);
    rawSetView(view);
    setViewTasks(newViewTasks);
  }

  function containsTask(tasks: Array<Task>, task: Task): boolean {
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].id == task.id) {
        return true;
      }
    }
    return false;
  }

  async function updateTask(task: Task) {
    await invoke("update_task", { task: task });
    if (containsTask(sideBarTasks, task)) {
      setSideBarTasks(await invoke("get_root_tasks"));
    }
    if (containsTask(viewTasks, task)) {
      setViewTasks(await getTasksForView(view));
    }
  }

  async function newTask() {
    await invoke("new_task");
    if (view == Mode.Inbox) {
      setViewTasks(await getTasksForView(view));
    }
  }

  useEffect(() => {
    (async () => {
      setSideBarTasks(await invoke("get_root_tasks"));
      setViewTasks(await getTasksForView(view));
    })();
  }, []);

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
      <div className="bg-stone-900 col-span-1 h-screen">
        <SideView
          newTask={newTask}
          setView={setView}
          tasks={sideBarTasks}
          updateTask={updateTask}
          view={view}
        />
      </div>

      <div className="bg-stone-800 col-span-4 h-screen">
        <MainView
          newTask={newTask}
          setView={setView}
          tasks={viewTasks}
          updateTask={updateTask}
          view={view}
        />
      </div>
    </div>
  );
}
export default App;
