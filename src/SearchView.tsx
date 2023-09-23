import classNames from "classnames";
import { invoke } from "@tauri-apps/api/tauri";
import { useDebounce } from "usehooks-ts";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import "./SearchView.css";

export interface ISearchViewProps {
  shown: bool,
  setShown: (bool) => any,
}

function SearchView(props: ISearchViewProps) {
  let [input, setInput] = useState("");
  let [tasks, setTasks] = useState([]);

  useHotkeys("esc", () => {
    props.setShown(false);
  });

  useEffect(() => {
    (async () => {
      if (input.length == 0) {
        setTasks([]);
        return;
      }
      let searchedTasks = await invoke("search", {input: input});
      setTasks(searchedTasks);
    })();
  }, [input]);

  return (
    <div
      className={classNames("search-view", {
        "hidden": !props.shown,
      })}
      onClick={(_) => props.setShown(false)}
    >
      <div className="search-area" onClick={(e) => {e.stopPropagation()}}>
        <input
          className="search-input"
          onChange={(e) => setInput(e.target.value)}
          placeholder="Task title"
          type="text"
          value={input}
        />

        <div className="search-output">
          {tasks.map((task, i) =>
            <div>{task.title}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchView;
