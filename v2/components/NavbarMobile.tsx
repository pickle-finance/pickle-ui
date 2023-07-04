import { FC } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import Link from "next/link";

import SlideOverMenu from "./SlideOverMenu";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "v2/features/theme/ThemeToggle";
import { ThemeSelectors } from "v2/store/theme";
import { matchingLogoSrc } from "v2/features/theme/themes";

const NavbarMobile: FC = () => {
  const theme = useSelector(ThemeSelectors.selectTheme);

  return (
    <div className="block sm:hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="flex-shrink-0 py-8 w-40 -ml-6">
          <Link href="/" passHref>
            <Image
              src={matchingLogoSrc(theme)}
              width={0}
              height={0}
              sizes="100vw"
              style={{width: "158px", height: "auto"}}
              alt="Pickle Finance Logo"
              priority
            />
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
};

export default NavbarMobile;
