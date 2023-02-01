import { PickleModelJson } from "picklefinance-core";
import { PnlTransactionWrapper } from "picklefinance-core/lib/client/pnl/UserHistoryInterfaces";
import { JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";
import { FC, useState } from "react";
import { classNames } from "v2/utils";
import CurrentSummary from "./CurrentSummary";
import SortToggle from "./SortToggle";
import TxHistoryTable from "./TxHistoryTable";

const TxHistoryContainer: FC<{
  wallet: string;
  userPnl: PnlTransactionWrapper[];
  core: PickleModelJson.PickleModelJson;
  addrs: { [key: string]: string };
  jar: JarDefinition;
  className?: string;
}> = ({ wallet, userPnl, core, addrs, jar, className }) => {
  const [txSort, setTxSort] = useState<"old" | "new">("old");
  const lastTxn = userPnl.sort(
    (a, b) => b.userTransaction.timestamp - a.userTransaction.timestamp,
  )[0];
  return (
    <div className={classNames("pr-5 mb-8 min-w-min", className)}>
      <CurrentSummary lastTxn={lastTxn} jar={jar} />
      <div className="flex">
        <h2 className="whitespace-nowrap font-body font-bold text-xl text-foreground-alt-200 mt-3 mb-8">
          {"User History"}
        </h2>
        <div className="w-full flex justify-end">
          <SortToggle txSort={txSort} setTxSort={setTxSort} />
        </div>
      </div>
      {core && <TxHistoryTable wallet={wallet} userPnl={userPnl} core={core} addrs={addrs} txSort={txSort} />}
    </div>
  );
};

export default TxHistoryContainer;
