import { FC, HTMLAttributes } from "react";
import Link from "next/link";
import { ExternalLinkIcon } from "@heroicons/react/solid";

import { classNames } from "../utils";

interface Props extends HTMLAttributes<HTMLElement> {
  href: string;
  external?: boolean;
  active?: boolean;
  primary?: boolean;
}

const AppLink: FC<Props> = ({ active, children, className, external, href, primary, onClick }) => {
  return (
    <Link href={href}>
      <a
        href={href}
        onClick={onClick}
        className={classNames(
          active && "bg-background-light text-primary-light",
          primary ? "text-accent" : "text-foreground",
          "group inline-flex items-center text-sm rounded-lg hover:text-primary-light transition duration-300 ease-in-out",
          className,
        )}
        {...(external && { target: "_blank", rel: "noopener" })}
      >
        {children}
        {external && (
          <ExternalLinkIcon
            className={classNames(
              primary ? "text-accent" : "text-foreground",
              "group-hover:text-primary-light ml-2 flex-shrink-0 h-4 w-4 transition duration-300 ease-in-out",
            )}
            aria-hidden="true"
          />
        )}
      </a>
    </Link>
  );
};

export default AppLink;
