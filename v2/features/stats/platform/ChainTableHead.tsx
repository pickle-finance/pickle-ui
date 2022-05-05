import { useTranslation } from "next-i18next";
import { FC } from "react";

const ChainHead: FC = () => {
  const { t } = useTranslation("common");
  return (
    <thead className="rounded-t-md">
      <tr className="w-full border border-foreground-alt-400 bg-foreground-alt-400">
        <th scope="col" className="text-left xl:pl-20 lg:pl-20 md:pl-10 sm:pl-10 pt-2 pb-2">
          {t("v2.stats.platform.chainTableHeaders.chain")}
        </th>
        <th scope="col" className="text-left pt-2 pb-2">
          {t("v2.stats.platform.chainTableHeaders.currentRevs")}
        </th>
        <th scope="col" className="text-left pt-2 pb-2">
          {t("v2.stats.platform.chainTableHeaders.revsChange")}
        </th>
        <th scope="col" className="text-left pt-2 pb-2">
          {t("v2.stats.platform.chainTableHeaders.tvl")}
        </th>
        <th scope="col" className="text-left pt-2 pb-2">
          {t("v2.stats.platform.chainTableHeaders.tvlChange")}
        </th>
      </tr>
    </thead>
  );
};

export default ChainHead;
