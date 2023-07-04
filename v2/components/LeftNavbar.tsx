import { FC } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "next-i18next";

import NavItems from "./NavItems";
import PicklePriceIndicator from "./PicklePriceIndicator";
import { ThemeSelectors } from "v2/store/theme";
import { matchingLogoSrc } from "v2/features/theme/themes";
import UserBalancesStatus from "v2/features/connection/UserBalancesStatus";

const LeftNavbar: FC = () => {
  const { t } = useTranslation("common");
  const theme = useSelector(ThemeSelectors.selectTheme);

  return (
    <div className="hidden sm:flex sm:flex-col sm:w-64 sm:fixed sm:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 bg-background py-8 border-r border-foreground-alt-500">
        <div className="flex items-center justify-center h-16 flex-shrink-0 px-4 mb-12">
          <div className="w-44">
            <Link aria-label="Pickle Finance home" href="/" passHref>
              <Image
                src={matchingLogoSrc(theme)}
                width={0}
                height={0}
                sizes="100vw"
                style={{width: "300px", height: "auto",}}
                // layout="responsive"
                alt={t("meta.titleFull")}
                title={t("meta.titleFull") as string}
                priority
              />
            </Link>
          </div>
        </div>
        <div className="flex flex-col grow justify-between px-10">
          <div className="flex flex-col overflow-y-auto">
            <NavItems />
          </div>
          <div className="flex flex-col relative items-center">
            <PicklePriceIndicator />
            <div className="flex justify-center absolute -bottom-4">
              <UserBalancesStatus />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftNavbar;
