import { FC, HTMLAttributes, ComponentProps } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ExternalLinkIcon } from "@heroicons/react/solid";

import { classNames } from "ws/utils";

interface Props extends HTMLAttributes<HTMLElement> {
  href: string;
  Icon?: (props: ComponentProps<"svg">) => JSX.Element;
  isExternal?: boolean;
}

const NavItem: FC<Props> = ({
  href,
  children,
  className,
  Icon,
  isExternal,
}) => {
  const extraClasses = className ? className : "";
  const router = useRouter();
  const isCurrent = isExternal ? false : router.pathname.endsWith(href);
  const linkProps = isExternal ? { target: "_blank", rel: "noopener" } : {};

  return (
    <div className="flex items-center">
      <Link href={href}>
        <a
          href={href}
          className={classNames(
            isCurrent ? "bg-black-light text-green-light" : "",
            `group flex flex-grow items-center px-4 py-2 text-white text-sm rounded-lg font-bold hover:text-green-light transition duration-300 ease-in-out ${extraClasses}`,
          )}
          {...linkProps}
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
          {isExternal && (
            <ExternalLinkIcon
              className="text-white group-hover:text-green-light ml-2 flex-shrink-0 h-4 w-4"
              aria-hidden="true"
            />
          )}
        </a>
      </Link>
    </div>
  );
};

export default NavItem;
