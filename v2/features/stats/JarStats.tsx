import { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PickleModelJson } from "picklefinance-core";

import { AssetWithData, CoreSelectors } from "v2/store/core";
import type { JarChartData, SetFunction, UserJarHistory, UserTx } from "v2/types";
import ChartContainer from "v2/features/stats/jar/ChartContainer";
import DocContainer, { RelatedTokens } from "v2/features/stats/jar/DocContainer";
import RevTableContainer from "v2/features/stats/jar/RevTableContainer";
import FarmsTable from "v2/features/farms/FarmsTable";
import { JarSelectData } from "./JarSelect";
import { readyState } from "pages/stats";
// import { useAccount } from "v2/hooks";
import { JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";
import { useTranslation } from "next-i18next";
import TxHistoryContainer from "./jar/userHistory/TxHistoryContainer";
import { generatePnL } from "./jar/userHistory/utils/PnL";

const JarStats: FC<{
  core: PickleModelJson.PickleModelJson | undefined;
  jar: JarSelectData;
  ready: readyState;
  setReady: SetFunction;
  page: "platform" | "chain" | "jar" | undefined;
}> = ({ core, jar, ready, setReady, page }) => {
  const { t } = useTranslation("common");
  // const account = useAccount();
  const account = "0xfeedc450742ac0d9bb38341d9939449e3270f76f";
  let assets = useSelector(CoreSelectors.makeAssetsSelector({ filtered: false, paginated: false }));

  const [jarData, setJarData] = useState<JarChartData>({} as JarChartData);
  const [userHistory, setUserHistory] = useState<UserJarHistory>();
  const [jarHistoryWithPnl, setJarHistoryWithPnl] = useState<UserTxWithPnl[]>();

  const [txSort, setTxSort] = useState<"old" | "new">("old");
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
    const getUserHistory = async (account: string | null | undefined): Promise<void> => {
      account &&
        (await fetch(`https://api.pickle.finance/prod/protocol/userhistory/${account}`)
          .then((resp) => resp.json())
          .then((jsonResp) => {
            setUserHistory(jsonResp);
            // DEBUG_OUT(jsonResp);
          }));
    };
    getUserHistory(account);
  }, [account]);
  useEffect(() => {
    if (userHistory && userHistory[jar.value]) {
      let pnl = generatePnL(userHistory[jar.value]);
      let userJarHistory = userHistory[jar.value];
      const jarHistoryWithPnl: UserTxWithPnl[] = userJarHistory.map((txn) => {
        let i = userJarHistory.indexOf(txn);
        return {
          ...txn,
          ...pnl[i],
        };
      });
      setJarHistoryWithPnl(jarHistoryWithPnl);
    }
  }, [userHistory]);

  // useEffect(() => {
  //   console.log(jarHistoryWithPnl);
  // }, [jarHistoryWithPnl]);

  if (asset && page === "jar" && ready[page])
    return (
      <>
        <div className="mb-3 min-w-min">
          {asset && asset.depositTokensInJar && (
            <FarmsTable singleAsset={asset} hideDescription={true} />
          )}
        </div>
        {jarHistoryWithPnl && (
          <TxHistoryContainer
            txHistory={jarHistoryWithPnl}
            core={core}
            addrs={addrs}
            txSort={txSort}
            setTxSort={setTxSort}
            t={t}
          />
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

export interface UserTxWithPnl extends UserTx {
  action: "deposit" | "withdraw" | "other";
  value: number;
  nTokens: number;
  costBasis: number;
  totalNTokens: number;
  totalCostBasis: number;
  totalCost: number;
  pl?: number;
  totalTradingPnL?: number;
  totalRewardsUSD?: number;
}

const DEBUG_OUT = (msg: any) => {
  if (GLOBAL_DEBUG) console.log(msg);
};
const GLOBAL_DEBUG = true;

export default JarStats;
