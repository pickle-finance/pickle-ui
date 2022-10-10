import { TFunction } from "next-i18next";
import { PickleModelJson } from "picklefinance-core";
import { Dispatch, FC, SetStateAction } from "react";
import { classNames } from "v2/utils";
import { UserTxWithPnl } from "../../JarStats";
import SortToggle from "./SortToggle";
import TxHistoryTable from "./TxHistoryTable";

const TxHistoryContainer: FC<{
  txHistory: UserTxWithPnl[] | undefined;
  core: PickleModelJson.PickleModelJson | undefined;
  addrs: { [key: string]: string };
  txSort: "old" | "new";
  setTxSort: Dispatch<SetStateAction<any>>;
  t: TFunction;
  className?: string;
}> = ({ txHistory, core, addrs, txSort, setTxSort, t, className }) => {
  if (!txHistory || !core) return <></>;
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
      {core && <TxHistoryTable txHistory={txHistory} sort={txSort} core={core} addrs={addrs} />}
    </div>
  );
};

export default TxHistoryContainer;
