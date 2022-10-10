import { Disclosure, Transition } from "@headlessui/react";
import { PickleModelJson } from "picklefinance-core";
import { RawChain } from "picklefinance-core/lib/chain/Chains";
import { FC, Fragment } from "react";
import { classNames } from "v2/utils";
import { UserTxWithPnl } from "../../JarStats";
import TxTableRowBody from "./TxTableRowBody";
import TxTableRowHeader from "./TxTableRowHeader";
import TxTableSpacerRow from "./TxTableSpacerRow";
import { uuid } from "uuidv4";

const TxTableBody: FC<{
  txs: UserTxWithPnl[];
  sort: "old" | "new";
  core: PickleModelJson.PickleModelJson;
  addrs: { [key: string]: string };
}> = ({ txs, sort, core, addrs }) => {
  return (
    <>
      {txs &&
        sort === "old" &&
        txs
          .sort((a, b) => a.timestamp - b.timestamp)
          .map((tx) => {
            return <TxTableRow key={uuid()} core={core} tx={tx} addrs={addrs} />;
          })}
      {txs &&
        sort === "new" &&
        txs
          .sort((a, b) => b.timestamp - a.timestamp)
          .map((tx) => {
            return <TxTableRow key={tx.hash} core={core} tx={tx} addrs={addrs} />;
          })}
    </>
  );
};

const TxTableRow: FC<{
  tx: UserTxWithPnl;
  core: PickleModelJson.PickleModelJson;
  addrs: { [key: string]: string };
}> = ({ tx, core, addrs }) => {
  const chain: RawChain | undefined = core.chains.filter((c) => c.chainId === tx.chain_id)[0];
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
              {core && <TxTableRowHeader tx={tx} core={core} open={open} />}
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
                    transfers={tx.transfers}
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
