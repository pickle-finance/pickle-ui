import { FC } from "react";
import { useTranslation } from "next-i18next";

import LanguageToggle from "./LanguageToggle";

const LeftNavbar: FC = () => {
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-grow px-4 py-2 sm:px-10 sm:py-10 text-white">
      <div className="pr-4">
        <h1 className="font-title font-medium text-2xl sm:text-3xl">
          {t("v2.dashboard.pickleTitle")}
        </h1>
        <h1 className="font-body font-normal text-gray-light text-sm sm:text-base leading-4 sm:leading-6 mt-1">
          {t("v2.dashboard.pickleSubtitle")}
        </h1>
      </div>
      <div className="flex flex-grow justify-end self-center">
        <LanguageToggle />
      </div>
    </div>
  );
};

export default LeftNavbar;
