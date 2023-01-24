import { PickleModelJson } from "picklefinance-core";
import { PnlTransactionWrapper } from "picklefinance-core/lib/client/pnl/UserHistoryInterfaces";
import { FC, useEffect, useState } from "react";
import { classNames } from "v2/utils";
import Pagination from "./Pagination";
import TxTableBody from "./TxTableBody";

const TxHistoryTable: FC<{
  userPnl: PnlTransactionWrapper[];
  core: PickleModelJson.PickleModelJson;
  addrs: { [key: string]: string };
  txSort: "old" | "new";
  className?: string;
}> = ({ userPnl, core, addrs, txSort, className }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const sortedPnl =
    txSort === "old"
      ? userPnl.sort((a, b) => a.userTransaction.timestamp - b.userTransaction.timestamp)
      : userPnl.sort((a, b) => b.userTransaction.timestamp - a.userTransaction.timestamp);
  const displayPnl =
    currentPage * 6 + 6 < sortedPnl.length
      ? sortedPnl.slice(currentPage * 6, currentPage * 6 + 6)
      : sortedPnl.slice(currentPage * 6);
  return (
    <div className={classNames("flex flex-col", className)}>
      <div className="-my-2 overflow-x-auto overflow-y-visible">
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
              <TxTableHeaderCell label="Profit/Loss When Closed" />
              <TxTableHeaderCell label="" />
            </tr>
          </thead>
          <tbody className="text-foreground mt-12">
            <TxTableBody userPnl={displayPnl} core={core} addrs={addrs} txSort={txSort} />
          </tbody>
        </table>
        <div className="flex justify-center mt-4">
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageCount={Math.ceil(userPnl.length / 6)}
          />
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
