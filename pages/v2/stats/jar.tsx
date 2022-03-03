import { FC, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { CoreSelectors } from "v2/store/core";
import type { PickleFinancePage } from "v2/types";
import { ChartContainer } from "v2/features/stats/jar/ChartContainer";
import { JarChartData } from "v2/features/stats/jar/types";
import { DocContainer } from "v2/features/stats/jar/DocContainer";
import { RevContainer } from "v2/features/stats/jar/RevContainer";
import { PickleModelJson } from "picklefinance-core";

const getJarData = async (jarKey: string): Promise<JarChartData> => {
  const url = `${process.env.apiJar}/${jarKey}/en`;
  return await fetch(url).then((response) => response.json());
};

const Stats: PickleFinancePage = () => {
  const core = useSelector(CoreSelectors.selectCore);
  const [jarData, setJarData] = useState<JarChartData>({} as JarChartData);
  const router = useRouter();
  const jar: string =
    typeof router.query.jar === "string" ? router.query.jar : "";

  useEffect(() => {
    const getData = async (): Promise<void> => {
      getJarData(jar).then((data) => setJarData(data));
    };
    getData();
  }, [jar]);
  return (
    <div className="block lg:flex mb-8 sm:mb-10">
      <div className="w-full mb-4 lg:w-1/2 lg:mr-8 lg:mb-0 xl:w-4/5">
        <ChartContainer jarData={jarData} />
        <br />
        {jarData && jarData.documentation && (
          <DocContainer docs={jarData.documentation} />
        )}
        <br />
        {jarData &&
          jarData.revenueExpenses &&
          jarData.revenueExpenses.recentHarvests[0] && (
            <RevContainer
              revs={jarData.revenueExpenses}
              pfCore={core ? core : ({} as PickleModelJson.PickleModelJson)}
            />
          )}
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
