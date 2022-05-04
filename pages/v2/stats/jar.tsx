import { FC, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { NextRouter, useRouter } from "next/router";
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

  const { t } = useTranslation("common");
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [jarData, setJarData] = useState<JarChartData>({} as JarChartData);

  const asset: JarWithData | undefined = assets.find(
    (a) => a.details.apiKey.toLowerCase() === apiKey.toLowerCase(),
  );

  useEffect(() => {
    if (typeof router.query.jar === "string") setApiKey(router.query.jar);
  }, [router]);

  useEffect(() => {
    const getData = async (): Promise<void> => {
      getJarData(apiKey).then((data) => setJarData(data));
    };
    getData();
  }, [apiKey]);

  // if (!asset.depositTokensInJar) console.log(asset);

  return (
    <div className="block lg:flex mb-8 sm:mb-10">
      <div className="w-full mb-4 lg:w-full lg:mr-8 lg:mb-0 xl:w-full">
        <Back router={router} chain={asset ? asset.chain : "eth"} text={t("v2.stats.jar.back")} />
        <div className="mb-5">
          {asset && asset.depositTokensInJar && (
            <FarmsTable asset={asset} singleAsset={true} hideDescription={true} />
          )}
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

const Back: FC<{ router: NextRouter; chain: string; text: string }> = ({ router, chain, text }) => (
  <span
    className="text-accent cursor-pointer pb-5"
    onClick={() => router.push(`/v2/stats/chain?chain=${chain}`)}
  >
    {text}
  </span>
);

Stats.PageTitle = PageTitle;

export { getStaticProps } from "../../../util/locales";

export default Stats;
