import { PickleModelJson } from "picklefinance-core";
import { FC } from "react";
import { classNames } from "v2/utils";
import { UserTxWithPnl } from "../../JarStats";
import TxTableBody from "./TxTableBody";

const TxHistoryTable: FC<{
  txHistory: UserTxWithPnl[];
  core: PickleModelJson.PickleModelJson;
  addrs: { [key: string]: string };
  sort: "old" | "new";
  className?: string;
}> = ({ txHistory, core, addrs, sort, className }) => {
  return (
    <div className={classNames("flex flex-col", className)}>
      <div className="-my-2 overflow-x-auto overflow-y-hidden min-w-min">
        <div className="py-2 pr-4 align-middle inline-block min-w-full max-h-[80vh] overflow-y-scroll">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-background uppercase">
              <tr>
                <TxTableHeaderCell label="Date/Time" />
                <TxTableHeaderCell label="Block Num." />
                <TxTableHeaderCell label="TX Type" />
                <TxTableHeaderCell label="TX Hash" />
                <TxTableHeaderCell label="TX Value" />
                <TxTableHeaderCell label="N Tokens" />
                <TxTableHeaderCell label="Token Bal." />
                <TxTableHeaderCell label="Total Cost" />
                <TxTableHeaderCell label="Profit/Loss" />
                {/* Chevron down/up column */}
              </tr>
            </thead>
            <tbody className="text-foreground">
              <TxTableBody txs={txHistory} sort={sort} core={core} addrs={addrs} />
            </tbody>
          </table>
          {/* <div className="flex justify-center mt-4">
            <Pagination />
          </div> */}
        </div>
      </div>
    </div>
  );
};

const TxTableHeaderCell: FC<{ label: string }> = ({ label }) => (
  <th
    scope="col"
    className="px-4 py-1 h-8 text-left text-xs font-bold text-foreground-alt-200 tracking-normal sm:px-6"
  >
    {label}
  </th>
);

export default TxHistoryTable;
