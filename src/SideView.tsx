import classNames from "classnames";
import { PlusIcon } from "@heroicons/react/24/solid";

import Button from "./Button.tsx";
import { Mode, Task, View } from "./types.ts";
import { getIconForMode } from "./icons.tsx";

export interface ISideViewProps {
  newTask: () => any,
  setView: (view: View) => any,
  tasks: Array<Task>,
  view: View,
}

function SideView(props: ISideViewProps) {
  return (
    <div className="flex flex-col h-full px-3 py-5">
      <div>
        <Category mode={Mode.Inbox} currentView={props.view} setCurrentView={props.setView} />

        <div className="my-3"></div>

        <Category mode={Mode.Today} currentView={props.view} setCurrentView={props.setView} />
        <Category mode={Mode.Upcoming} currentView={props.view} setCurrentView={props.setView} />
        <Category mode={Mode.Anytime} currentView={props.view} setCurrentView={props.setView} />
        <Category mode={Mode.Someday} currentView={props.view} setCurrentView={props.setView} />

        <div className="my-3"></div>

        <Category mode={Mode.Logbook} currentView={props.view} setCurrentView={props.setView} />
        <Category mode={Mode.Trash} currentView={props.view} setCurrentView={props.setView} />

        <div className="my-3"></div>
      </div>

      <div className="overflow-y-scroll">
        {props.tasks.map((task) =>
          <CategoryTask
            key={task.id}
            task={task}
            currentView={props.view}
            setCurrentView={props.setView}
          />
        )}
      </div>

      <div className="border-t border-stone-800 pt-2">
        <Button onClick={props.newTask}>
          <span className="inline-block"><PlusIcon className="w-4 h-4" /></span>
          <span className="mx-0.5"></span>
          <span className="inline">New Task</span>
        </Button>
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

export default SideView;
