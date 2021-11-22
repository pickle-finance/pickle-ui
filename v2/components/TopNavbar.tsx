import { FC } from "react";
import { useTranslation } from "next-i18next";

import LanguageToggle from "./LanguageToggle";
import GasPriceIndicator from "./GasPriceIndicator";
import NetworkToggle from "./NetworkToggle";
import WalletToggle from "./WalletToggle";

const LeftNavbar: FC = () => {
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-grow mb-12">
      <div className="pr-4">
        <h1 className="font-title font-medium text-2xl sm:text-3xl">
          {t("v2.dashboard.pickleTitle")}
        </h1>
        <h2 className="font-body font-normal text-gray-light text-sm sm:text-base leading-4 sm:leading-6 mt-1">
          {t("v2.dashboard.pickleSubtitle")}
        </h2>
      </div>
      <div className="flex-grow justify-end items-center hidden sm:flex">
        <LanguageToggle />
        <NetworkToggle />
        <GasPriceIndicator />
        <WalletToggle />
      </div>
    </div>
  );
};

export default LeftNavbar;
