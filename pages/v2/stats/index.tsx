import { FC, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { ChartContainer } from "v2/features/stats/platform/ChartContainer";
import { ChainTableContainer } from "v2/features/stats/platform/ChainTableContainer";
import { PlatformData } from "v2/types";
import type { PickleFinancePage } from "v2/types";

const getPlatformData = async (): Promise<PlatformData> => {
  const url = `${process.env.apiPlatform}`
  return await fetch(url).then((response) => response.json());
};

const Stats: PickleFinancePage = () => {
  const [dataSeries, setDataSeries] = useState<PlatformData>(
    {} as PlatformData,
  );

  useEffect(() => {
    const getData = async (): Promise<void> => {
      getPlatformData().then((platformData) => setDataSeries(platformData));
    };
    getData();
  }, []);

  return (
    <div className="block lg:flex mb-8 sm:mb-10">
      <div className="w-full mb-4 lg:w-1/2 lg:mr-8 lg:mb-0 xl:w-4/5">
        <ChartContainer chart="tvl" dataSeries={dataSeries} />
        <ChartContainer chart="revs" dataSeries={dataSeries} />
        <ChainTableContainer chains={dataSeries.chains} />
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
