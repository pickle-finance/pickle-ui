import { FC, HTMLAttributes, ComponentProps } from "react";
import { useRouter } from "next/router";

import Link from "./Link";
import { classNames } from "../utils";

interface Props extends HTMLAttributes<HTMLElement> {
  href: string;
  Icon?: (props: ComponentProps<"svg">) => JSX.Element;
  external?: boolean;
}

const NavItem: FC<Props> = ({ href, children, className, Icon, external, onClick }) => {
  const router = useRouter();

  const isCurrent = (): boolean => {
    if (external) return false;
    if (href === "/" && router.pathname !== "/") return false;

    return router.pathname.startsWith(href);
  };

  return (
    <div className="flex items-center">
      <Link
        href={href}
        external={external}
        active={isCurrent()}
        onClick={onClick}
        className={classNames("px-4 py-2 font-bold", className)}
      >
        {Icon && (
          <Icon
            className={classNames(
              isCurrent() ? "text-primary-light" : "text-foreground group-hover:text-primary-light",
              "mr-2 flex-shrink-0 h-5 w-5 transition duration-300 ease-in-out",
            )}
            aria-hidden="true"
          />
        )}
        {children}
      </Link>
    </div>
  );
};

export default NavItem;
