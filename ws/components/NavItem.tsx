import Link from "next/link";
import { FC, HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLElement> {
  href: string;
}

const NavItem: FC<Props> = ({ href, children, className }) => {
  const extraClasses = className ? className : "";

  return (
    <div className="flex items-center">
      <Link href={href}>
        <a
          className={`text-white px-3 text-sm font-bold hover:text-green-light transition duration-300 ease-in-out ${extraClasses}`}
          target="_blank"
          rel="noopener"
        >
          {children}
        </a>
      </Link>
    </div>
  );
};

export default NavItem;
