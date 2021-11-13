import { FC } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarIcon,
  ChartBarIcon,
  FolderIcon,
  HomeIcon,
  InboxIcon,
  UsersIcon,
} from "@heroicons/react/outline";

import pickleLogo from "public/pickle-logo.png";

const navigation = [
  { name: "Dashboard", href: "#", icon: HomeIcon, current: true },
  { name: "Jars & farms", href: "#", icon: UsersIcon, current: false },
  { name: "DILL", href: "#", icon: FolderIcon, current: false },
  { name: "Stats", href: "#", icon: ChartBarIcon, current: false },
  { name: "F.A.Q.", href: "#", icon: CalendarIcon, current: false },
  { name: "Feedback", href: "#", icon: InboxIcon, current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const Navbar: FC = () => (
  <div className="hidden sm:flex sm:flex-col sm:w-64 sm:fixed sm:inset-y-0">
    <div className="flex-1 flex flex-col min-h-0 bg-black py-8 border-r border-gray-dark">
      <div className="flex items-center justify-center h-16 flex-shrink-0 px-4 mb-12">
        <div className="w-32">
          <Link href="/ws">
            <a aria-label="Pickle Finance home">
              <Image
                src={pickleLogo}
                width={500}
                height={191}
                priority
                layout="responsive"
                alt="Pickle Finance home"
                title="Pickle Finance home"
                placeholder="blur"
              />
            </a>
          </Link>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 space-y-1">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={classNames(
                item.current
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white",
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
              )}
            >
              <item.icon
                className={classNames(
                  item.current
                    ? "text-gray-300"
                    : "text-gray-400 group-hover:text-gray-300",
                  "mr-3 flex-shrink-0 h-6 w-6",
                )}
                aria-hidden="true"
              />
              {item.name}
            </a>
          ))}
        </nav>
      </div>
    </div>
  </div>
);

export default Navbar;
