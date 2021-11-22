import Link from "next/link";
import { HTMLAttributes, FC } from "react";

import { classNames } from "../utils";

type Size = "large";
type Type = "secondary";

const externalAttributes = {
  target: "_blank",
  rel: "noopener",
};

interface Props extends HTMLAttributes<HTMLElement> {
  href: string;
  size?: Size;
  type?: Type;
  external?: boolean;
}

const Button: FC<Props> = ({
  href,
  children,
  className,
  size,
  type,
  external,
}) => {
  return (
    <Link href={href}>
      <a
        className={classNames(
          "inline-flex items-center border-2 text-sm font-bold rounded-2xl shadow-sm focus:outline-none transition duration-300 ease-in-out",
          size === "large" ? "px-6 py-4 uppercase" : "px-4 py-2",
          type === "secondary"
            ? "text-orange bg-transparent border-orange hover:bg-orange-lightest hover:border-orange-light hover:text-orange-light"
            : "text-white bg-orange border-transparent hover:bg-orange-light",
          className,
        )}
        {...(external && externalAttributes)}
      >
        {children}
      </a>
    </Link>
  );
};
export default Button;
