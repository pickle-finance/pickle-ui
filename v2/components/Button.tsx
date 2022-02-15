import { HTMLAttributes, FC, MouseEventHandler } from "react";

import { classNames, noop } from "../utils";

type Size = "small" | "normal" | "large";
type Type = "primary" | "secondary" | "disabled";

interface Props extends HTMLAttributes<HTMLElement> {
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  size?: Size;
  type?: Type;
}

const Button: FC<Props> = ({
  onClick = noop,
  children,
  className,
  size = "normal",
  type = "primary",
}) => {
  return (
    <a
      className={classNames(
        size === "normal" && "p-4 rounded-2xl leading-3",
        size === "large" && "px-6 py-4 uppercase rounded-2xl",
        size === "small" && "p-2 leading-4 rounded-xl leading-2",
        type === "primary" &&
          "text-base bg-orange border-transparent hover:bg-orange-light",
        type === "secondary" &&
          "text-orange bg-transparent border-orange hover:bg-orange-lightest hover:border-orange-light hover:text-orange-light",
        type === "disabled" &&
          "bg-gray-outline text-gray-outline-light border-transparent cursor-not-allowed",
        "inline-flex items-center cursor-pointer border-2 text-sm font-bold shadow-sm focus:outline-none transition duration-300 ease-in-out",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </a>
  );
};
export default Button;
