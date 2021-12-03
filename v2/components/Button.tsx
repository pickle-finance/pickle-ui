import { HTMLAttributes, FC, MouseEventHandler } from "react";

import { classNames } from "../utils";

type Size = "small" | "normal" | "large";
type Type = "secondary";

interface Props extends HTMLAttributes<HTMLElement> {
  handleClick: MouseEventHandler<HTMLAnchorElement>;
  size: Size;
  type?: Type;
  external?: boolean;
}

const Button: FC<Props> = ({
  handleClick,
  children,
  className,
  size,
  type,
}) => {
  return (
    <a
      className={classNames(
        "inline-flex items-center cursor-pointer border-2 text-sm font-bold shadow-sm focus:outline-none transition duration-300 ease-in-out",
        size === "normal" && "p-4 rounded-2xl leading-3",
        size === "large" && "px-6 py-4 uppercase rounded-2xl",
        size === "small" && "p-2 leading-4 rounded-xl leading-2",
        type === "secondary"
          ? "text-orange bg-transparent border-orange hover:bg-orange-lightest hover:border-orange-light hover:text-orange-light"
          : "text-white bg-orange border-transparent hover:bg-orange-light",
        className,
      )}
      onClick={handleClick}
    >
      {children}
    </a>
  );
};
export default Button;
