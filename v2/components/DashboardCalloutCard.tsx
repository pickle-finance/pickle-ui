import { FC } from "react";
import Link from "next/link";
import { useTranslation, Trans } from "next-i18next";
import { ArrowRightIcon } from "@heroicons/react/outline";

import { formatPercentage } from "../utils";

const DashboardCalloutCard: FC = () => {
  const { t } = useTranslation("common");

  return (
    <Link href="/v2/farms">
      <div className="group bg-black-light rounded-xl border border-gray-dark shadow cursor-pointer transition duration-300 ease-in-out hover:bg-black-lighter">
        <div className="flex justify-between px-5 py-4 sm:px-8 sm:py-5">
          <div className="pr-4">
            <p className="font-body font-bold text-lg sm:text-xl leading-6 mb-1">
              <Trans i18nKey="v2.dashboard.earnUpTo">
                Earn up to
                <span className="text-green">
                  {{ percent: formatPercentage(5.92) }}
                </span>
                APY
              </Trans>
            </p>
            <p className="text-gray-lighter text-xs sm:text-sm font-normal leading-5">
              {t("v2.dashboard.extraBoost")}
            </p>
          </div>
          <div className="flex items-center">
            <ArrowRightIcon className="w-6 h-6 text-gray-light group-hover:text-orange transition duration-300 ease-in-out" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DashboardCalloutCard;
