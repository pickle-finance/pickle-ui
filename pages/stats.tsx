import { FC, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { PickleFinancePage, PlatformData } from "v2/types";
import ChartContainer from "v2/features/stats/platform/ChartContainer";
import ChainTableContainer from "v2/features/stats/platform/ChainTableContainer";
import ChainSelect from "v2/features/stats/ChainSelect";
import { useAppSelector } from "v2/store";
import { CoreSelectors } from "v2/store/core";
import JarSelect from "v2/features/stats/JarSelect";
import { ChainNetwork } from "picklefinance-core";

const Stats: PickleFinancePage = () => {
  const core = useAppSelector(CoreSelectors.selectCore);
  const [dataSeries, setDataSeries] = useState<PlatformData>({} as PlatformData);
  const [selectedChain, setSelectedChain] = useState<String>("");
  const [selectedJar, setSelectedJar] = useState<String>("");

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
          <div className="flex gap-5">
            <ChainSelect setSelectedChain={setSelectedChain} />
            {selectedChain && (
              <JarSelect
                core={core}
                selectedChain={selectedChain as ChainNetwork}
                setSelectedJar={setSelectedJar}
              />
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
