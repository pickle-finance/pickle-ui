import { FC } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useTranslation, Trans } from "next-i18next";
import { ArrowRightIcon } from "@heroicons/react/outline";
import { AssetProtocol } from "picklefinance-core/lib/model/PickleModelJson";

import { formatPercentage } from "../utils";
import { useAppDispatch } from "v2/store";
import { CoreSelectors } from "v2/store/core";
import { setSort, SortType } from "v2/store/controls";
import MoreInfo from "./MoreInfo";

const DashboardCalloutCard: FC = () => {
  const { t } = useTranslation("common");
  let coreMaxApy = useSelector(CoreSelectors.selectMaxApy);
  const dispatch = useAppDispatch();

  if (!coreMaxApy)
    coreMaxApy = {
      name: "",
      chain: "Ethereum",
      apy: 0,
      tokens: [],
      protocol: AssetProtocol.UNISWAP,
    };

  return (
    <Link href="/farms" passHref>
      <div
        className="group bg-background-light rounded-xl border border-foreground-alt-500 shadow cursor-pointer transition duration-300 ease-in-out hover:bg-background-lightest"
        onClick={() => {
          coreMaxApy?.tokens &&
            coreMaxApy.apy &&
            dispatch(setSort({ type: SortType.Apy, direction: "desc" }));
        }}
      >
        <div className="flex justify-between px-5 py-4 sm:px-8 sm:py-5">
          <div className="pr-4">
            <p className="font-body font-bold text-lg sm:text-xl leading-6 mb-1">
              <Trans i18nKey="v2.dashboard.earnUpTo">
                Earn up to
                <span className="text-primary">
                  {{ percent: formatPercentage(coreMaxApy.apy) }}
                </span>
                <MoreInfo>
                  <span className="mr-2">{coreMaxApy.name}</span>
                  <span className="text-foreground-alt-200 text-sm">{coreMaxApy.chain}</span>
                </MoreInfo>
                APY
              </Trans>
            </p>
            <p className="text-foreground-alt-100 text-xs sm:text-sm font-normal leading-5">
              {t("v2.dashboard.extraBoost")}
            </p>
          </div>
          <div className="flex items-center">
            <ArrowRightIcon className="w-6 h-6 text-foreground-alt-200 group-hover:text-accent transition duration-300 ease-in-out" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DashboardCalloutCard;
