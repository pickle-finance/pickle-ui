import { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PickleModelJson } from "picklefinance-core";

import { AssetWithData, CoreSelectors } from "v2/store/core";
import FarmsTable from "v2/features/farms/FarmsTable";
import { JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";
import { useTranslation } from "next-i18next";
import TxHistoryContainer from "./jar/userHistory/TxHistoryContainer";
import { UserJarHistoryPnlGenerator } from "picklefinance-core";
import {
  PnlTransactionWrapper,
  UserJarHistory,
} from "picklefinance-core/lib/client/pnl/UserHistoryInterfaces";
import { useAccount } from "v2/hooks";
import { readyState } from "pages/stats";
import { SetFunction } from "v2/types";
import { UserStatsReady } from "pages/robtest";

export interface UserAssetsHistoryWrapper {
  [apiKey: string]: PnlTransactionWrapper[];
}

const UserStats: FC<{
  core: PickleModelJson.PickleModelJson | undefined;
  ready: UserStatsReady;
  setReady: SetFunction;
}> = ({ core, ready,setReady }) => {
  const { t } = useTranslation("common");
  const account = useAccount();
  //const account = "0xfeedc450742ac0d9bb38341d9939449e3270f76f";
  let assets = useSelector(CoreSelectors.makeAssetsSelector({ filtered: false, paginated: false }));

  const [userHistory, setUserHistory] = useState<UserJarHistory>();
  const [wrappedUserHistory, setWrappedUserHistory] = useState<UserAssetsHistoryWrapper>();


  // fetch all user txn history if there is any
  useEffect(() => {
    const getUserHistory = async (account: string | null | undefined): Promise<void> => {
      account &&
        (await fetch(`https://api.pickle.finance/prod/protocol/userhistory/${account}`)
          .then((resp) => resp.json())
          .then((jsonResp) => {
            if (!JSON.stringify(jsonResp).toLowerCase().includes("invalid wallet")) {
              setUserHistory(jsonResp);
              const keys = Object.keys(jsonResp);
              const allAssetsHistory: UserAssetsHistoryWrapper = {};
              for( let i = 0; i < keys.length; i++ ) {
                const v = jsonResp[keys[i]];
                try {
                  let pnl = new UserJarHistoryPnlGenerator(account, v).generatePnL();
                  allAssetsHistory[keys[i]] = pnl;
                } catch( e ) {
                  // ignore
                }
              }
              setWrappedUserHistory(allAssetsHistory);
            } else {
              console.info(jsonResp);
            }
            
          }).then(() => setReady({page:true}))
          );
    };
    getUserHistory(account);
  }, [account]);

  if (core) {
    // generate pnl report for one jar from user history if/when it loads
    // let pnl = new UserJarHistoryPnlGenerator(account, userHistory[jar.value]).generatePnL();
    const t1: UserAssetsHistoryWrapper | undefined = wrappedUserHistory;
    const t2: UserAssetsHistoryWrapper = t1 ? t1 : {};
    const keys = Object.keys(t2);
    const findJar = (apiKey: string): JarDefinition | undefined => core.assets.jars.find((j) => j && j.details && j.details.apiKey && j.details.apiKey.toLowerCase() === apiKey.toLowerCase());
    const addrsFor = (apiKey: string) => {
      const j1: JarDefinition | undefined = findJar(apiKey);
      const addrs = Object.fromEntries(
        Object.entries({
          User: account ? account.toLowerCase() : "account not found",
          Jar: j1 ? j1.contract.toLowerCase() : "jar not found",
          Farm: j1 && j1.farm ? j1.farm.farmAddress.toLowerCase() : "farm not found",
          Null: "0x0000000000000000000000000000000000000000",
        }).map(([key, value]) => [value, key])
      );
      const chain = core?.chains.filter((c) => c.network === String(j1?.chain))[0];
      addrs["chain_native"] = chain
        ? `${chain.gasToken[0].toUpperCase()}${chain.gasTokenSymbol.slice(1)}`
        : "chain native";    
      return addrs;
    };
    return (
      <>
        {keys.map((k:string) => 
          (
            <TxHistoryContainer wallet={account || ""} userPnl={t2[k]} core={core} addrs={addrsFor(k)} jar={findJar(k) || {} as JarDefinition} />
          )
        )}
      </>
    );
  }
  return null;
};


const DEBUG_OUT = (msg: any) => {
  if (GLOBAL_DEBUG) console.log(msg);
};
const GLOBAL_DEBUG = false;

export default UserStats;
