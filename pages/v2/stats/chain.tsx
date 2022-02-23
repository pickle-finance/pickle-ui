import { FC, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import type { PickleFinancePage } from "v2/types";
import { ChartContainer } from "v2/features/stats/chain/ChartContainer";
import { ChainData } from "v2/features/stats/chain/types";
import { AssetTableContainer } from "v2/features/stats/chain/AssetTableContainer";

const getChainData = async (chain: string): Promise<ChainData> => {
  const url = `${process.env.apiChain}/${chain}/en`
  return await fetch(url).then((response) => response.json());
};

const Stats: PickleFinancePage = () => {
  const [chainData, setChainData] = useState<ChainData>({} as ChainData);
  const router = useRouter();
  const chain: string =
    typeof router.query.chain === "string" ? router.query.chain : "";

  useEffect(() => {
    const getData = async (): Promise<void> => {
      getChainData(chain).then((data) => setChainData(data));
    };
    getData();
  }, [chain]);

  return (
    <div className="block lg:flex mb-8 sm:mb-10">
      <div className="w-full mb-4 lg:w-1/2 lg:mr-8 lg:mb-0 xl:w-4/5">
        <ChartContainer chart="tvl" dataSeries={chainData} />
        <ChartContainer chart="revs" dataSeries={chainData} />
        <AssetTableContainer assets={chainData.assets} />
      </div>
    </div>
  );
};

const PageTitle: FC = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <h1 className="font-title font-medium text-2xl sm:text-3xl pt-2">
        {t("v2.nav.stats")}
      </h1>
      <h2 className="font-body font-normal text-foreground-alt-200 text-sm sm:text-base leading-4 sm:leading-6 mt-1">
        {t("v2.stats.subtitle")}
      </h2>
    </>
  );
};

Stats.PageTitle = PageTitle;

export { getStaticProps } from "../../../util/locales";

export default Stats;
