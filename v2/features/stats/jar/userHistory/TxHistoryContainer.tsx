import { TFunction } from "next-i18next";
import { PickleModelJson } from "picklefinance-core";
import { Dispatch, FC, SetStateAction } from "react";
import { UserTx } from "v2/types";
import { classNames } from "v2/utils";
import SortToggle from "./SortToggle";
import TxHistoryTable from "./TxHistoryTable";

const TxHistoryContainer: FC<{
  txHistory: UserTx[];
  core: PickleModelJson.PickleModelJson;
  addrs: { [key: string]: string };
  txSort: "old" | "new";
  setTxSort: Dispatch<SetStateAction<any>>;
  t: TFunction;
  className?: string;
}> = ({ txHistory, core, addrs, txSort, setTxSort, t, className }) => (
  <div className={classNames("pr-5", className)}>
    <div className="flex justify-between">
      <h2 className="font-body font-bold text-xl text-foreground-alt-200 mt-3 mb-5">
        {"User History"}
      </h2>
      <SortToggle txSort={txSort} setTxSort={setTxSort} />
    </div>
    {core && <TxHistoryTable txHistory={txHistory} core={core} addrs={addrs} />}
  </div>
);

export default TxHistoryContainer;
