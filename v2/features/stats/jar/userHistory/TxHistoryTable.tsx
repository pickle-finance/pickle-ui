import { PickleModelJson } from "picklefinance-core";
import { PnlTransactionWrapper } from "picklefinance-core/lib/client/pnl/UserHistoryInterfaces";
import { FC } from "react";
import { classNames } from "v2/utils";
import TxTableBody from "./TxTableBody";

const TxHistoryTable: FC<{
  userPnl: PnlTransactionWrapper[];
  core: PickleModelJson.PickleModelJson;
  addrs: { [key: string]: string };
  txSort: "old" | "new";
  className?: string;
}> = ({ userPnl, core, addrs, txSort, className }) => {
  return (
    <div className={classNames("flex flex-col", className)}>
      <div className="-my-2 overflow-x-auto overflow-y-visible max-h-[50vh]">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-background uppercase sticky top-0">
            <tr>
              <TxTableHeaderCell label="Date/Time" />
              <TxTableHeaderCell label="TX Type" />
              <TxTableHeaderCell label="TX Hash" />
              <TxTableHeaderCell label="Jar Tokens" />
              <TxTableHeaderCell label="Token Bal." />
              <TxTableHeaderCell label="TX Value" />
              <TxTableHeaderCell label="Rewards" />
              <TxTableHeaderCell label="Profit/Loss" />
              <TxTableHeaderCell label="" />
            </tr>
          </thead>
          <tbody className="text-foreground mt-12">
            <TxTableBody userPnl={userPnl} core={core} addrs={addrs} txSort={txSort} />
          </tbody>
        </table>
        {/* <div className="flex justify-center mt-4">
            <Pagination />
          </div> */}
        {/* </div> */}
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
