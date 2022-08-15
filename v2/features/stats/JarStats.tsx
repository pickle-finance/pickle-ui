import { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PickleModelJson } from "picklefinance-core";

import { AssetWithData, CoreSelectors } from "v2/store/core";
import type { JarChartData, SetFunction, UserTx } from "v2/types";
import ChartContainer from "v2/features/stats/jar/ChartContainer";
import DocContainer from "v2/features/stats/jar/DocContainer";
import RevTableContainer from "v2/features/stats/jar/RevTableContainer";
import FarmsTable from "v2/features/farms/FarmsTable";
import { JarSelectData } from "./JarSelect";
import { readyState } from "pages/stats";
import { useAccount } from "v2/hooks";
import TxHistoryTable from "./jar/userHistory/TxHistoryTable";

const JarStats: FC<{
  core: PickleModelJson.PickleModelJson | undefined;
  jar: JarSelectData;
  ready: readyState;
  setReady: SetFunction;
  page: "platform" | "chain" | "jar" | undefined;
}> = ({ core, jar, ready, setReady, page }) => {
  const account = useAccount();

  let assets = useSelector(CoreSelectors.makeAssetsSelector({ filtered: false, paginated: false }));
  const [jarData, setJarData] = useState<JarChartData>({} as JarChartData);
  const [userJarHistory, setUserJarHistory] = useState<UserTx[]>([]);

  const [asset, setAsset] = useState<AssetWithData>({} as AssetWithData);
  useEffect(() => {
    let asset: AssetWithData | undefined;
    if (assets && jar && jar.value)
      asset = assets.find((a) => a.details.apiKey.toLowerCase() === jar.value.toLowerCase());
    if (asset) setAsset(asset);
  }, [jar, assets]);

  useEffect(() => {
    const getData = async (): Promise<void> => {
      if (Object.keys(jar).length > 0)
        getJarData(jar.value)
          .then((data) => setJarData(data))
          .then(() => setReady((prev: readyState) => ({ ...prev, jar: true })));
    };
    getData();
  }, [jar]);

  useEffect(() => {
    const getUserJarHistory = async (account: string | null | undefined): Promise<void> => {
      account &&
        (await fetch(`https://api.pickle.finance/prod/protocol/userhistory/${account}`)
          .then((resp) => resp.json())
          .then((jsonResp) => {
            setUserJarHistory(jsonResp ? jsonResp[jar.value].reverse() : []);
          }));
    };
    getUserJarHistory(account);
  }, [account]);

  // useEffect(() => console.log(userJarHistory), [userJarHistory]);

  if (asset && page === "jar" && ready[page])
    return (
      <>
        <div className="mb-3">
          {asset && asset.depositTokensInJar && (
            <FarmsTable singleAsset={asset} hideDescription={true} />
          )}
        </div>
        <ChartContainer jarData={jarData} />
        {jarData && jarData.documentation && <DocContainer docs={jarData.documentation} />}
        {userJarHistory && userJarHistory.length > 0 && (
          <TxHistoryTable txHistory={userJarHistory} className="my-10" />
        )}
        {jarData &&
          jarData.revenueExpenses &&
          jarData.revenueExpenses.recentHarvests.length > 0 && (
            <RevTableContainer
              revs={jarData.revenueExpenses}
              pfCore={core ? core : ({} as PickleModelJson.PickleModelJson)}
            />
          )}
      </>
    );
  return null;
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
