import { FC, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { ChainData, PickleFinancePage, PlatformData, SelectData } from "v2/types";
import { useAppSelector } from "v2/store";
import { CoreSelectors } from "v2/store/core";

import ChartContainer from "v2/features/stats/shared/ChartContainer";
import ChainTableContainer from "v2/features/stats/platform/ChainTableContainer";
import ChainSelect, { ChainSelectData } from "v2/features/stats/ChainSelect";
import JarSelect, { JarSelectData } from "v2/features/stats/JarSelect";
import Breadcrumbs from "v2/features/stats/Breadcrumbs";
import ChainStats from "v2/features/stats/chain";
import JarStats from "v2/features/stats/jar";

const Stats: PickleFinancePage = () => {
  const core = useAppSelector(CoreSelectors.selectCore);
  const [dataSeries, setDataSeries] = useState<PlatformData>({} as PlatformData);

  const [chain, setChain] = useState({} as ChainSelectData);
  const [jar, setJar] = useState({} as JarSelectData);

  useEffect(() => {
    const getData = async (): Promise<void> => {
      getPlatformData().then((platformData) => setDataSeries(platformData));
    };
    getData();
  }, []);

  return (
    <div className="block lg:flex mb-8 sm:mb-10">
      <div className="w-full mb-4">
        <>
          <Breadcrumbs chain={chain} jar={jar} setChain={setChain} setJar={setJar} />
          <div className="flex gap-5">
            <ChainSelect chain={chain} setChain={setChain} setJar={setJar} />
            {Object.keys(chain).length > 0 && (
              <JarSelect core={core} chain={chain.value} jar={jar} setJar={setJar} />
            )}
          </div>
          {Object.keys(chain).length === 0 && Object.keys(jar).length === 0 && (
            <PlatformStats dataSeries={dataSeries} />
          )}
          {Object.keys(chain).length > 0 && Object.keys(jar).length === 0 && (
            <ChainStats core={core} chain={chain.value} />
          )}
          {Object.keys(chain).length > 0 && Object.keys(jar).length > 0 && (
            <JarStats core={core} jar={jar.value} />
          )}
        </>
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

const PlatformStats: FC<{ dataSeries: PlatformData }> = ({ dataSeries }) => (
  <>
    <div className="w-full lg:columns-2 md:columns-1 gap-5">
      <ChartContainer chart="tvl" dataSeries={dataSeries} />
      <ChartContainer chart="revs" dataSeries={dataSeries} />
    </div>
    <ChainTableContainer chains={dataSeries.chains} />
  </>
);

const getPlatformData = async (): Promise<PlatformData> => {
  // https://api.pickle.finance/prod/protocol/analytics/
  const url = `${process.env.apiPlatform}`;
  return await fetch(url).then((response) => response.json());
};

const getChainData = async (chain: string): Promise<ChainData> => {
  // https://api.pickle.finance/prod/protocol/analytics/chain/{chain}/en
  const url = `${process.env.apiChain}/${chain}/en`;
  return await fetch(url)
    .then((response) => response.json())
    .catch((e) => console.log(e));
};

Stats.PageTitle = PageTitle;

export { getStaticProps } from "v1/util/locales";

export default Stats;
