import { FC, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { NextRouter, useRouter } from "next/router";
import type { PickleFinancePage, ChainData } from "v2/types";

import ChartContainer from "v2/features/stats/chain/ChartContainer";
import AssetTableContainer from "v2/features/stats/chain/AssetTableContainer";
import BigMoverTableContainer from "v2/features/stats/chain/BigMoverTableContainer";
import {
  getTokenPriceChangePct,
  getTVLChange,
  iBigMoverTableData,
} from "v2/features/stats/chain/BigMoverUtils";
import LoadingIndicator from "v2/components/LoadingIndicator";
import { useSelector } from "react-redux";
import { CoreSelectors } from "v2/store/core";

const Stats: PickleFinancePage = () => {
  const core = useSelector(CoreSelectors.selectCore);

  const [chainData, setChainData] = useState<ChainData>({} as ChainData);
  const [tokenPctChangeData, setTokenPctChangeData] = useState<iBigMoverTableData[]>([]);
  const [tvlChange, setTvlChange] = useState<iBigMoverTableData[]>([]);

  const { t } = useTranslation("common");
  const router: NextRouter = useRouter();
  const chain: string = typeof router.query.chain === "string" ? router.query.chain : "";
  useEffect(() => {
    const getData = async (): Promise<void> => {
      if (chain)
        getChainData(chain).then((data) => {
          setChainData(data);
        });
    };
    getData();
  }, [chain]);

  useEffect(() => {
    const tokenPriceChangePct = getTokenPriceChangePct(chainData);
    setTokenPctChangeData(tokenPriceChangePct);
    const tvlChange = getTVLChange(chainData);
    setTvlChange(tvlChange);
  }, [chainData]);

  tokenPctChangeData.sort((a, b) => (a.tokenPriceChange > b.tokenPriceChange ? -1 : 1));
  tvlChange.sort((a, b) => (a.tvlChange > b.tvlChange ? -1 : 1));

  return (
    <div className="block lg:flex mb-5 sm:mb-10">
      <div className="w-full min-w-full mb-4 lg:w-full lg:mr-8 lg:mb-0 xl:w-full">
        <Back router={router} text={t("v2.stats.chain.back")} />
        {tvlChange.length > 0 && tokenPctChangeData.length > 0 && (
          <>
            <BigMoverTableContainer type="tvl" tableData={tvlChange} />
            <BigMoverTableContainer type="tokenPct" tableData={tokenPctChangeData} />
          </>
        )}
        {chainData.assets && core ? (
          <>
            <ChartContainer chart="tvl" dataSeries={chainData} />
            <ChartContainer chart="revs" dataSeries={chainData} />
            <AssetTableContainer assets={chainData?.assets} core={core} />
          </>
        ) : (
          <LoadingIndicator />
        )}
      </div>
    </div>
  );
};

const PageTitle: FC = () => {
  const { t } = useTranslation("common");
  const router: NextRouter = useRouter();
  const chain: string = typeof router.query.chain === "string" ? router.query.chain : "";

  return (
    <>
      <h1 className="font-title font-medium text-2xl sm:text-3xl pt-2">
        {t("v2.nav.stats").concat(chain ? ` - ${chain.toUpperCase()}` : "")}
      </h1>
      <h2 className="font-body font-normal text-foreground-alt-200 text-sm sm:text-base leading-4 sm:leading-6 mt-1">
        {t("v2.stats.subtitle")}
      </h2>
    </>
  );
};

const getChainData = async (chain: string): Promise<ChainData> => {
  // https://api.pickle.finance/prod/protocol/analytics/chain/{chain}/en
  const url = `${process.env.apiChain}/${chain}/en`;
  return await fetch(url)
    .then((response) => response.json())
    .catch((e) => console.log(e));
};

const Back: FC<{ router: NextRouter; text: string }> = ({ router, text }) => (
  <div className="mb-5">
    <span className="text-accent cursor-pointer" onClick={() => router.push("/v2/stats")}>
      {text}
    </span>
  </div>
);

Stats.PageTitle = PageTitle;

export { getStaticProps } from "../../../util/locales";

export default Stats;
