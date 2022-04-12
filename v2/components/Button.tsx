import { HTMLAttributes, FC, MouseEventHandler } from "react";

import { classNames, noop } from "../utils";

export type ButtonSize = "small" | "normal" | "large";
export type ButtonType = "primary" | "secondary";
type ButtonState = "enabled" | "disabled";

interface Props extends HTMLAttributes<HTMLElement> {
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  size?: ButtonSize;
  type?: ButtonType;
  state?: ButtonState;
}

const Button: FC<Props> = ({
  onClick = noop,
  children,
  className,
  size = "normal",
  type = "primary",
  state = "enabled",
}) => {
  return (
    <div className={classNames("inline-block", state === "disabled" && "cursor-not-allowed")}>
      <a
        className={classNames(
          size === "normal" && "p-4 rounded-2xl leading-3",
          size === "large" && "px-6 py-4 uppercase rounded-2xl",
          size === "small" && "p-2 leading-4 rounded-xl leading-2",
          type === "primary" &&
            state === "enabled" &&
            "text-foreground-button bg-accent border-transparent cursor-pointer hover:bg-accent-light",
          type === "secondary" &&
            state === "enabled" &&
            "text-accent bg-transparent border-accent cursor-pointer hover:bg-accent-light hover:bg-opacity-20 hover:border-accent-light hover:text-accent-light",
          state === "disabled" &&
            "bg-foreground-alt-400 text-foreground-alt-300 border-transparent pointer-events-none",
          "inline-flex justify-center items-center border-2 text-sm font-bold shadow-sm focus:outline-none transition duration-300 ease-in-out",
          className,
        )}
        onClick={onClick}
      >
        {children}
      </a>
    </div>
  );
};
export default Button;
