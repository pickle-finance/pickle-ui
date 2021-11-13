import { FC, HTMLAttributes, ComponentProps } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { classNames } from "ws/utils";

interface Props extends HTMLAttributes<HTMLElement> {
  href: string;
  Icon: (props: ComponentProps<"svg">) => JSX.Element;
}

const NavItem: FC<Props> = ({ href, children, className, Icon }) => {
  const extraClasses = className ? className : "";
  const router = useRouter();
  const current = router.pathname.endsWith(href);

  return (
    <div className="flex items-center">
      <Link href={href}>
        <a
          href={href}
          className={classNames(
            current ? "bg-black-light text-green-light" : "",
            `group flex flex-grow items-center px-4 py-2 text-white text-sm rounded-lg font-bold hover:text-green-light transition duration-300 ease-in-out ${extraClasses}`,
          )}
        >
          <Icon
            className={classNames(
              current
                ? "text-green-light"
                : "text-white group-hover:text-green-light",
              "mr-2 flex-shrink-0 h-6 w-6",
            )}
            aria-hidden="true"
          />
          {children}
        </a>
      </Link>
    </div>
  );
};

export default NavItem;
