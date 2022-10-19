import { Disclosure, Transition } from "@headlessui/react";
import { PickleModelJson } from "picklefinance-core";
import { RawChain } from "picklefinance-core/lib/chain/Chains";
import { FC, Fragment } from "react";
import { classNames } from "v2/utils";
import TxTableRowBody from "./TxTableRowBody";
import TxTableRowHeader from "./TxTableRowHeader";
import TxTableSpacerRow from "./TxTableSpacerRow";
import { v4 as uuid } from "uuid";
import { PnlTransactionWrapper } from "picklefinance-core/lib/client/pnl/UserHistoryInterfaces";

const TxTableBody: FC<{
  userPnl: PnlTransactionWrapper[];
  core: PickleModelJson.PickleModelJson;
  addrs: { [key: string]: string };
  txSort: "old" | "new";
}> = ({ userPnl, core, addrs, txSort }) => {
  return (
    <>
      {txSort === "old"
        ? userPnl
            .sort((a, b) => a.userTransaction.timestamp - b.userTransaction.timestamp)
            .map((tx) => (
              <TxTableRow
                key={uuid()}
                tx={tx}
                userPnl={userPnl}
                txSort={txSort}
                core={core}
                addrs={addrs}
              />
            ))
        : userPnl
            .sort((a, b) => b.userTransaction.timestamp - a.userTransaction.timestamp)
            .map((tx) => (
              <TxTableRow
                key={uuid()}
                tx={tx}
                userPnl={userPnl}
                txSort={txSort}
                core={core}
                addrs={addrs}
              />
            ))}
    </>
  );
};

const TxTableRow: FC<{
  tx: PnlTransactionWrapper;
  userPnl: PnlTransactionWrapper[];
  txSort: "old" | "new";
  core: PickleModelJson.PickleModelJson;
  addrs: { [key: string]: string };
}> = ({ tx, userPnl, txSort, core, addrs }) => {
  const chain: RawChain | undefined = core.chains.filter(
    (c) => c.chainId === tx.userTransaction.chain_id,
  )[0];
  return (
    <>
      <Disclosure as={Fragment}>
        {({ open }) => (
          <>
            <Disclosure.Button
              as="tr"
              // No hover state when the row is expaned.
              className={classNames(!open && "group", "cursor-pointer")}
            >
              {core && (
                <TxTableRowHeader
                  tx={tx}
                  userPnl={userPnl}
                  txSort={txSort}
                  core={core}
                  open={open}
                />
              )}
            </Disclosure.Button>

            <Transition
              as={Fragment}
              enter="transition duration-100 ease-out"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition duration-100 ease-out"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Disclosure.Panel as="tr">
                {core && chain && (
                  <TxTableRowBody
                    transfers={tx.userTransaction.transfers}
                    core={core}
                    chain={chain}
                    addrs={addrs}
                  />
                )}
              </Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>
      <TxTableSpacerRow />
    </>
  );
};

export default TxTableBody;
