import { PickleModelJson } from "picklefinance-core";
import { FC } from "react";
import { UserTx } from "v2/types";
import { classNames } from "v2/utils";
import TxTableBody from "./TxTableBody";

const TxHistoryTable: FC<{
  txHistory: UserTx[];
  core: PickleModelJson.PickleModelJson;
  addrs: { [key: string]: string };
  className?: string;
}> = ({ txHistory, core, addrs, className }) => {
  return (
    <div className={classNames("flex flex-col", className)}>
      <div className="-my-2 overflow-x-auto">
        <div className="py-2 align-middle inline-block min-w-full">
          <table className="min-w-1/2 table-auto border-collapse">
            <thead className="bg-background uppercase">
              <tr>
                <TxTableHeaderCell label="Date/Time" />
                <TxTableHeaderCell label="Block Num." />
                <TxTableHeaderCell label="TX Type" />
                <TxTableHeaderCell label="TX Hash" />
                {/* Chevron down/up column */}
              </tr>
            </thead>
            <tbody className="text-foreground">
              <TxTableBody txs={txHistory} core={core} addrs={addrs} />
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
