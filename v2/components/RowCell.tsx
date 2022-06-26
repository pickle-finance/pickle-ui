import { FC, HTMLAttributes } from "react";
import Tippy from "@tippyjs/react";
import { classNames } from "v2/utils";

const RowCell: FC<HTMLAttributes<HTMLElement>> = ({ children, className }) => (
  <td
    className={classNames(
      "bg-background-light p-4 whitespace-nowrap text-sm text-foreground sm:p-6 group-hover:bg-background-lightest transition duration-300 ease-in-out",
      className,
    )}
  >
    {children}
  </td>
);

export default RowCell;
