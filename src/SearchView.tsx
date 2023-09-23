import classNames from "classnames";
import { useHotkeys } from "react-hotkeys-hook";

import "./SearchView.css";

export interface ISearchViewProps {
  shown: bool,
  setShown: (bool) => any,
}

function SearchView(props: ISearchViewProps) {
  useHotkeys("esc", () => {
    props.setShown(false);
  });

  return (
    <div
      className={classNames("search-view", {
        "hidden": !props.shown,
      })}
      onClick={(_) => props.setShown(false)}
    >
      <div className="search-area" onClick={(e) => {e.stopPropagation()}}>
        here is some content??
      </div>
    </div>
  );
}

export default SearchView;
