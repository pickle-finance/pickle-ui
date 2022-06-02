import { FC, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { PickleFinancePage, PlatformData, SelectData } from "v2/types";
import { useAppSelector } from "v2/store";
import { CoreSelectors } from "v2/store/core";

import ChartContainer from "v2/features/stats/platform/ChartContainer";
import ChainTableContainer from "v2/features/stats/platform/ChainTableContainer";
import ChainSelect, { ChainSelectData } from "v2/features/stats/ChainSelect";
import JarSelect from "v2/features/stats/JarSelect";
import Breadcrumbs from "v2/features/stats/Breadcrumbs";

const Stats: PickleFinancePage = () => {
  const core = useAppSelector(CoreSelectors.selectCore);
  const [dataSeries, setDataSeries] = useState<PlatformData>({} as PlatformData);

  const [chain, setChain] = useState({} as ChainSelectData);

  const [selectedJar, setSelectedJar] = useState<String>();
  const [jar, setJar] = useState({} as SelectData);

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
          <div className="w-full lg:columns-2 md:columns-1 gap-5">
            <ChartContainer chart="tvl" dataSeries={dataSeries} />
            <ChartContainer chart="revs" dataSeries={dataSeries} />
          </div>
          <div className="w-full lg:columns-2 md:columns-1 gap-5">
            <ChainTableContainer chains={dataSeries.chains} />
            <div></div>
          </div>
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

const getPlatformData = async (): Promise<PlatformData> => {
  const url = `${process.env.apiPlatform}`;
  return await fetch(url).then((response) => response.json());
};

Stats.PageTitle = PageTitle;

export { getStaticProps } from "v1/util/locales";

export default Stats;
