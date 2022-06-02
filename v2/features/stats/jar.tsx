import { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PickleModelJson } from "picklefinance-core";

import { CoreSelectors } from "v2/store/core";
import type { JarChartData } from "v2/types";
import ChartContainer from "v2/features/stats/jar/ChartContainer";
import DocContainer from "v2/features/stats/jar/DocContainer";
import RevTableContainer from "v2/features/stats/jar/RevTableContainer";
import FarmsTable from "v2/features/farms/FarmsTable";

const JarStats: FC<{ core: PickleModelJson.PickleModelJson | undefined; jar: string }> = ({
  core,
  jar,
}) => {
  let assets = useSelector(CoreSelectors.makeAssetsSelector({ filtered: false, paginated: false }));

  const [jarData, setJarData] = useState<JarChartData>({} as JarChartData);

  const asset = assets.find((a) => a.details.apiKey.toLowerCase() === jar.toLowerCase());

  useEffect(() => {
    const getData = async (): Promise<void> => {
      getJarData(jar).then((data) => setJarData(data));
    };
    getData();
  }, [jar]);

  return (
    <>
      <div className="mb-5">
        {asset && asset.depositTokensInJar && (
          <FarmsTable singleAsset={asset} hideDescription={true} />
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

export default JarStats;
