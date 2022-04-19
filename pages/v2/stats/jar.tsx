import { FC, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { CoreSelectors, JarWithData } from "v2/store/core";
import type { PickleFinancePage, JarChartData } from "v2/types";
import { PickleModelJson } from "picklefinance-core";
import ChartContainer from "v2/features/stats/jar/ChartContainer";
import DocContainer from "v2/features/stats/jar/DocContainer";
import RevTableContainer from "v2/features/stats/jar/RevTableContainer";
import FarmsTable from "v2/features/farms/FarmsTable";

const Stats: PickleFinancePage = () => {
  const core = useSelector(CoreSelectors.selectCore);
  let assets = useSelector(CoreSelectors.makeJarsSelector({ filtered: false, paginated: false }));
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [jarData, setJarData] = useState<JarChartData>({} as JarChartData);

  const asset: JarWithData =
    assets.find((a) => a.details.apiKey.toLowerCase() === apiKey.toLowerCase()) ||
    ({} as JarWithData);

  useEffect(() => {
    if (typeof router.query.jar === "string") setApiKey(router.query.jar);
  }, [router]);

  useEffect(() => {
    const getData = async (): Promise<void> => {
      getJarData(apiKey).then((data) => setJarData(data));
    };
    getData();
  }, [apiKey]);

  return (
    <div className="block lg:flex mb-8 sm:mb-10">
      <div className="w-full mb-4 lg:w-1/2 lg:mr-8 lg:mb-0 xl:w-4/5">
        <div className="mb-5">
          {asset && asset.depositTokensInJar ? (
            <FarmsTable asset={asset} singleAsset={true} hideDescription={true} />
          ) : null}
        </div>
        <ChartContainer jarData={jarData} />
        <br />
        {jarData && jarData.documentation && <DocContainer docs={jarData.documentation} />}
        <br />
        {jarData && jarData.revenueExpenses && jarData.revenueExpenses.recentHarvests[0] && (
          <RevTableContainer
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
  const router = useRouter();
  const [jar, setJar] = useState("");
  useEffect(() => {
    if (typeof router.query.jar === "string") setJar(router.query.jar);
  }, [router]);
  // const jar: string = typeof router.query.jar === "string" ? router.query.jar : "";

  return (
    <>
      <h1 className="font-title font-medium text-2xl sm:text-3xl pt-2">
        {t("v2.nav.stats").concat(` - ${jar.toUpperCase()}`)}
      </h1>
      <h2 className="font-body font-normal text-foreground-alt-200 text-sm sm:text-base leading-4 sm:leading-6 mt-1">
        {t("v2.stats.subtitle")}
      </h2>
    </>
  );
};

const getJarData = async (jarKey: string): Promise<JarChartData> => {
  if (jarKey === "") return {} as JarChartData;
  const url = `${process.env.apiJar}/${jarKey}/en`;
  const data: JarChartData = await fetch(url)
    .then((response) => response.json())
    .catch((e) => console.log(e));
  return data;
};

Stats.PageTitle = PageTitle;

export { getStaticProps } from "../../../util/locales";

export default Stats;
