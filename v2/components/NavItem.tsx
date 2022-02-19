import { FC, HTMLAttributes, ComponentProps } from "react";
import { useRouter } from "next/router";

import Link from "./Link";
import { classNames } from "../utils";

interface Props extends HTMLAttributes<HTMLElement> {
  href: string;
  Icon?: (props: ComponentProps<"svg">) => JSX.Element;
  external?: boolean;
}

const NavItem: FC<Props> = ({ href, children, className, Icon, external }) => {
  const router = useRouter();
  const isCurrent = external ? false : router.pathname.endsWith(href);

  return (
    <div className="flex items-center">
      <Link
        href={href}
        external={external}
        active={isCurrent}
        className={classNames("px-4 py-2 font-bold", className)}
      >
        {Icon && (
          <Icon
            className={classNames(
              isCurrent
                ? "text-green-light"
                : "text-white group-hover:text-green-light",
              "mr-2 flex-shrink-0 h-5 w-5",
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
