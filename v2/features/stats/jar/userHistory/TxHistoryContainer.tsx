import { TFunction } from "next-i18next";
import { PickleModelJson } from "picklefinance-core";
import { PnlTransactionWrapper } from "picklefinance-core/lib/client/pnl/UserHistoryInterfaces";
import { FC, useState } from "react";
import { classNames } from "v2/utils";
import SortToggle from "./SortToggle";
import TxHistoryTable from "./TxHistoryTable";

const TxHistoryContainer: FC<{
  userPnl: PnlTransactionWrapper[] | undefined;
  core: PickleModelJson.PickleModelJson | undefined;
  addrs: { [key: string]: string };
  t: TFunction;
  className?: string;
}> = ({ userPnl, core, addrs, t, className }) => {
  const [txSort, setTxSort] = useState<"old" | "new">("old");

  if (!userPnl || !core) return <></>;
  return (
    <div className={classNames("pr-5 mb-8", "min-w-min border border-white", className)}>
      <div className="flex">
        <h2 className="whitespace-nowrap font-body font-bold text-xl text-foreground-alt-200 mt-3 mb-5">
          {"User History"}
        </h2>
        <div className="w-full flex justify-end">
          <SortToggle txSort={txSort} setTxSort={setTxSort} />
        </div>
      </div>
      {core && <TxHistoryTable userPnl={userPnl} core={core} addrs={addrs} txSort={txSort} />}
    </div>
  );
};

export default TxHistoryContainer;
