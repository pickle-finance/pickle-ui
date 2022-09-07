import { useTranslation } from "next-i18next";
import { PickleModelJson } from "picklefinance-core";
import { FC } from "react";
import { formatDollars, formatNumber } from "v2/utils";

const PlatformHeader: FC<{ core: PickleModelJson.PickleModelJson | undefined }> = ({ core }) => {
  const { t } = useTranslation("common");
  return (
    <>
      {core && (
        <div className="bg-background-light rounded-xl border border-foreground-alt-500 shadow pt-2 pb-4 px-4 mb-5">
          <h2 className="font-body font-bold text-xl text-foreground-alt-200 mb-4">
            {t(`v2.stats.platform.pickle`)}
          </h2>
          <div className="grid grid-cols-5 justify-items-center">
            <div>
              <h2 className="font-title font-medium text-foreground text-lg leading-5">
                {formatNumber(core.platform.pickleTotalSupply)}
              </h2>
              <p className="font-body text-foreground-alt-200 font-normal text-xs leading-4">
                {t(`v2.stats.platform.pickleSupply`)}
              </p>
            </div>
            <div>
              <h2 className="font-title font-medium text-foreground text-lg leading-5">
                {formatDollars(core.platform.pickleMarketCap)}
              </h2>
              <p className="font-body text-foreground-alt-200 font-normal text-xs leading-4">
                {t(`v2.stats.platform.marketCap`)}
              </p>
            </div>
            <div>
              <h2 className="font-title font-medium text-foreground text-lg leading-5">
                {formatNumber(
                  core.platform.pickleTotalSupply - core.platform.pickleCirculatingSupply,
                )}
              </h2>
              <p className="font-body text-foreground-alt-200 font-normal text-xs leading-4">
                {t(`v2.stats.platform.locked`)}
              </p>
            </div>
            <div>
              <h2 className="font-title font-medium text-foreground text-lg leading-5">
                {formatNumber(core.platform.pickleCirculatingSupply)}
              </h2>
              <p className="font-body text-foreground-alt-200 font-normal text-xs leading-4">
                {t(`v2.stats.platform.circulatingSupply`)}
              </p>
            </div>
            <div>
              <h2 className="font-title font-medium text-foreground text-lg leading-5">
                {formatDollars(core.platform.platformTVL)}
              </h2>
              <p className="font-body text-foreground-alt-200 font-normal text-xs leading-4">
                {t(`v2.stats.platform.platformTvl`)}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlatformHeader;
