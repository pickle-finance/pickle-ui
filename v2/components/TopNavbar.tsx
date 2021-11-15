import { FC } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "next-i18next";

const LeftNavbar: FC = () => {
  const { t } = useTranslation("common");

  return (
    <div className="px-4 py-2 sm:px-10 sm:py-10 text-white">
      <h1 className="font-title font-medium text-2xl sm:text-3xl">
        {t("v2.dashboard.pickleTitle")}
      </h1>
      <h1 className="font-body font-normal text-gray-light text-sm sm:text-base leading-4 sm:leading-6 mt-1">
        {t("v2.dashboard.pickleSubtitle")}
      </h1>
    </div>
  );
};

export default LeftNavbar;
