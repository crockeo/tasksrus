import React from "react";
import classNames from "classnames";

export interface IButtonProps {
  onClick: (evt: React.MouseEvent<HTMLButtonElement>) => any,
  children: Array<React.ReactElement>,
}

function Button(props: IButtonProps) {
  return (
    <button
      className={classNames(
        "border-stone-600",
        "m-px",
        "px-2",
        "py-1",
        "rounded",
        "cursor-default",

        "hover:border",
        "hover:m-0",

        "active:bg-stone-600",
        "active:border",
        "active:m-0",
      )}
      onClick={props.onClick}
    >
      <div className="flex items-center">
        {...props.children}
      </div>
    </button>
  );
}

export default Button;
