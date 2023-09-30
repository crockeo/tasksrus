import React from "react";
import classNames from "classnames";

export interface IButtonProps {
  onClick: (evt: React.MouseEvent<HTMLButtonElement>) => any;
  children: React.ReactElement | Array<React.ReactElement>;
  className?: string;
}

function Button(props: IButtonProps) {
  return (
    <button
      className={classNames(
        "block",
        "border",
        "border-transparent",
        "box-content",
        "cursor-default",
        "duration-100",
        "flex",
        "flex-row",
        "px-1",
        "py-1",
        "rounded",
        "transition-color",
        !!props.className ? props.className : "",

        "hover:border-stone-600",
        "active:bg-stone-600",
      )}
      onClick={props.onClick}
    >
      <div className="flex items-center">{props.children}</div>
    </button>
  );
}

export default Button;
