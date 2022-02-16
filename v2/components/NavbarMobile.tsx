import { FC } from "react";
import Image from "next/image";
import Link from "next/link";

import SlideOverMenu from "./SlideOverMenu";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "v2/features/theme/ThemeToggle";

const NavbarMobile: FC = () => (
  <div className="block sm:hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between">
      <div className="flex-shrink-0 py-8 w-36 sm:w-44">
        <Link href="/v2">
          <a>
            <Image
              src="/pickle.svg"
              width={158}
              height={60}
              layout="responsive"
              alt="Pickle Finance Logo"
              priority
            />
          </a>
        </Link>
      </div>
      <div className="flex items-center">
        <ThemeToggle />
        <LanguageToggle />
        <SlideOverMenu />
      </div>
    </div>
  </div>
);

export default NavbarMobile;
