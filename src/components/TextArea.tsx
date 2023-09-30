import classNames from "classnames";
import React, { useEffect, useRef } from "react";

export interface Props {
  onChange: (evt: React.ChangeEvent<HTMLTextAreaElement>) => any;
  value: string;

  className?: string;
}

function TextArea(props: Props) {
  const textareaRef = useRef(null as HTMLTextAreaElement | null);
  useEffect(() => {
    if (textareaRef.current != null) {
      textareaRef.current.style.height = "0px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = scrollHeight + "px";
    }
  }, [props.value]);

  return (
    <div
      className="flex grow whitespace-pre-wrap invisible"
      style={{ content: `"${props.value} "` }}
    >
      <textarea
        className={classNames(props.className, "resize-none", "visible")}
        onChange={props.onChange}
        ref={textareaRef}
        value={props.value}
      ></textarea>
    </div>
  );
}

export default TextArea;
