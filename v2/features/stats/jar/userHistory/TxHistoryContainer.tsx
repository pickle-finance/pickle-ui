import { TFunction } from "next-i18next";
import { PickleModelJson } from "picklefinance-core";
import { FC } from "react";
import { UserTx } from "v2/types";
import { classNames } from "v2/utils";
import TxHistoryTable from "./TxHistoryTable";

const TxHistoryContainer: FC<{
  txHistory: UserTx[];
  core: PickleModelJson.PickleModelJson;
  addrs: { [key: string]: string };
  t: TFunction;
  className?: string;
}> = ({ txHistory, core, addrs, t, className }) => (
  <div className={classNames("pr-5", className)}>
    <h2 className="font-body font-bold text-xl text-foreground-alt-200 mt-3 mb-5">
      {"User History"}
    </h2>
    {core && <TxHistoryTable txHistory={txHistory} core={core} addrs={addrs} />}
  </div>
);

export default TxHistoryContainer;
