import { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PickleModelJson } from "picklefinance-core";

import { AssetWithData, CoreSelectors } from "v2/store/core";
import type { JarChartData, SetFunction } from "v2/types";
import ChartContainer from "v2/features/stats/jar/ChartContainer";
import DocContainer from "v2/features/stats/jar/DocContainer";
import RevTableContainer from "v2/features/stats/jar/RevTableContainer";
import FarmsTable from "v2/features/farms/FarmsTable";
import { JarSelectData } from "./JarSelect";
import { ReadyState } from "pages/stats";
import { JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";
import { useTranslation } from "next-i18next";
import TxHistoryContainer from "./jar/userHistory/TxHistoryContainer";
import { generatePnL } from "picklefinance-core";
import {
  PnlTransactionWrapper,
  UserJarHistory,
} from "picklefinance-core/lib/client/pnl/UserHistoryInterfaces";
import RelatedTokens from "./jar/RelatedTokens";

const JarStats: FC<{
  core: PickleModelJson.PickleModelJson | undefined;
  jar: JarSelectData;
  ready: ReadyState;
  setReady: SetFunction;
  page: "platform" | "chain" | "jar" | undefined;
}> = ({ core, jar, ready, setReady, page }) => {
  const { t } = useTranslation("common");
  // const account = useAccount();
  const account = "0xfeedc450742ac0d9bb38341d9939449e3270f76f";
  let assets = useSelector(CoreSelectors.makeAssetsSelector({ filtered: false, paginated: false }));

  const [jarData, setJarData] = useState<JarChartData>({} as JarChartData);
  const [userHistory, setUserHistory] = useState<UserJarHistory>();
  const [userPnl, setUserPnl] = useState<PnlTransactionWrapper[]>();

  let asset: AssetWithData | undefined = {} as AssetWithData;
  let assetJar: JarDefinition | undefined = {} as JarDefinition;

  if (jar && jar.value)
    asset = assets.find((a) => a.details.apiKey.toLowerCase() === jar.value.toLowerCase());
  if (asset) assetJar = core?.assets.jars.find((j) => j.contract == asset?.contract);

  const addrs = Object.fromEntries(
    Object.entries({
      User: account ? account.toLowerCase() : "account not found",
      Jar: assetJar ? assetJar.contract.toLowerCase() : "jar not found",
      Farm: assetJar && assetJar.farm ? assetJar.farm.farmAddress.toLowerCase() : "farm not found",
      Null: "0x0000000000000000000000000000000000000000",
    }).map(([key, value]) => [value, key]),
  );

  const chain = core?.chains.filter((c) => c.network === String(assetJar?.chain))[0];
  addrs["chain_native"] = chain
    ? `${chain.gasToken[0].toUpperCase()}${chain.gasTokenSymbol.slice(1)}`
    : "chain native";

  // fetch jar documentation
  useEffect(() => {
    const getData = async (): Promise<void> => {
      if (Object.keys(jar).length > 0)
        getJarData(jar.value)
          .then((data) => setJarData(data))
          .then(() => setReady((prev: ReadyState) => ({ ...prev, jar: true })));
    };
    getData();
  }, [jar]); // eslint-disable-line

  // fetch all user txn history if there is any
  useEffect(() => {
    const getUserHistory = async (account: string | null | undefined): Promise<void> => {
      account &&
        (await fetch(`https://api.pickle.finance/prod/protocol/userhistory/${account}`)
          .then((resp) => resp.json())
          .then((jsonResp) => {
            if (!JSON.stringify(jsonResp).toLowerCase().includes("invalid wallet"))
              setUserHistory(jsonResp);
            else console.info(jsonResp);
          }));
    };
    getUserHistory(account);
  }, [account]);

  // generate pnl report for one jar from user history if/when it loads
  useEffect(() => {
    if (account && userHistory && userHistory[jar.value]) {
      let pnl = generatePnL(account, userHistory[jar.value]);
      DEBUG_OUT(pnl);
      setUserPnl(pnl);
    }
  }, [userHistory]); // eslint-disable-line

  if (asset && page === "jar" && ready[page])
    return (
      <>
        <div className="mb-3 min-w-min">
          {asset.depositTokensInJar && <FarmsTable singleAsset={asset} hideDescription={true} />}
        </div>
        {userPnl && userPnl.length > 0 && core && assetJar && (
          <TxHistoryContainer userPnl={userPnl} core={core} addrs={addrs} jar={assetJar} />
        )}
        <ChartContainer jarData={jarData} />
        {jarData && jarData.documentation && <DocContainer docs={jarData.documentation} />}
        <div>
          {jarData && jarData.documentation && (
            <RelatedTokens componentTokens={jarData.documentation.componentTokens} t={t} />
          )}
          {jarData &&
            jarData.revenueExpenses &&
            jarData.revenueExpenses.recentHarvests.length > 0 && (
              <RevTableContainer
                revs={jarData.revenueExpenses}
                pfCore={core ? core : ({} as PickleModelJson.PickleModelJson)}
              />
            )}
        </div>
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

const DEBUG_OUT = (msg: any) => {
  if (GLOBAL_DEBUG) console.log(msg);
};
const GLOBAL_DEBUG = true;

export default JarStats;
