import { FC, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { NextRouter, useRouter } from "next/router";
import type { PickleFinancePage, ChainData } from "v2/types";
import ChartContainer from "v2/features/stats/chain/ChartContainer";
import AssetTableContainer from "v2/features/stats/chain/AssetTableContainer";
import { getTokenPriceChangeBal, getTokenPriceChangePct } from "v2/features/stats/chain/BigMoverUtils";
import BigMoverTableContainer from "v2/features/stats/chain/BigMoverTableContainer";


const Stats: PickleFinancePage = () => {
  const [chainData, setChainData] = useState<ChainData>({} as ChainData);
  const [tokenPctChangeData, setTokenPctChangeData] = useState<iTokenPriceChange[]>([]);
  const [tokenBalChangeData, setTokenBalChangeData] = useState<iTokenPriceChange[]>([]);

  const router: NextRouter = useRouter();
  const chain: string = typeof router.query.chain === "string" ? router.query.chain : "";
  useEffect(() => {
    const getData = async (): Promise<void> => {
      if (chain) {
        await getChainData(chain).then((data) => {
          console.log(data)
          setChainData(data);
        });
        const tokenPriceChangePct = getTokenPriceChangePct(chainData)
        setTokenPctChangeData(tokenPriceChangePct);
        const tokenPriceChangeBal = getTokenPriceChangeBal(chainData)
        setTokenBalChangeData(tokenPriceChangeBal);
      }
    };
    getData();
  }, [chain]);
  tokenPctChangeData.sort((a, b) => a.tokenPriceChange > b.tokenPriceChange ? -1 : 1)
  tokenBalChangeData.sort((a, b) => a.tokenPriceChange > b.tokenPriceChange ? -1 : 1)


  return (
    <div className="block lg:flex mb-5 sm:mb-10"> 
      <div className="w-full mb-4 lg:w-1/2 lg:mr-8 lg:mb-0 xl:w-4/5">
        {tokenBalChangeData.length > 0 && tokenPctChangeData.length > 0 
          ? 
            <span>
              <BigMoverTableContainer type="pct" tableData={tokenPctChangeData}/>
              <BigMoverTableContainer type="bal" tableData={tokenBalChangeData}/>
            </span>
          : <></>
        }
        <ChartContainer chart="tvl" dataSeries={chainData} />
        <ChartContainer chart="revs" dataSeries={chainData} />
        <AssetTableContainer assets={chainData?.assets} />
      </div>
    </div>
  );
};

const PageTitle: FC = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <h1 className="font-title font-medium text-2xl sm:text-3xl pt-2">{t("v2.nav.stats")}</h1>
      <h2 className="font-body font-normal text-foreground-alt-200 text-sm sm:text-base leading-4 sm:leading-6 mt-1">
        {t("v2.stats.subtitle")}
      </h2>
    </>
  );
};

const getChainData = async (chain: string): Promise<ChainData> => {
  const url = `${process.env.apiChain}/${chain}/en`;
  console.log(url);
  return await fetch(url)
    .then((response) => response.json())
    .catch(e => console.log(e));
};

Stats.PageTitle = PageTitle;

export interface iTokenPriceChange {
  apiKey: string;
  tokenPriceChange: number;
}

export { getStaticProps } from "../../../util/locales";

export default Stats;
