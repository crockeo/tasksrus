import React from "react";
import classNames from "classnames";

export interface IButtonProps {
  onClick: (evt: React.MouseEvent<HTMLButtonElement>) => any;
  children: React.ReactElement | Array<React.ReactElement>;

  color?: string;
}

function Button(props: IButtonProps) {
  let border = !!props.color ? `border-${props.color}` : "border-stone-600";
  let background = !!props.color
    ? `active:bg-${props.color}`
    : "active:bg-stone-600";

  return (
    <button
      className={classNames(
        border,
        "m-px",
        "px-2",
        "py-1",
        "rounded",
        "cursor-default",

        "hover:border",
        "hover:m-0",

        background,
        "active:border",
        "active:m-0",
      )}
      onClick={props.onClick}
    >
      <div className="flex items-center">{props.children}</div>
    </button>
  );
}

export default Button;
