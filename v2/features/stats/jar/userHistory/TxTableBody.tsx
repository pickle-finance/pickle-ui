import { Disclosure, Transition } from "@headlessui/react";
import { PickleModelJson } from "picklefinance-core";
import { RawChain } from "picklefinance-core/lib/chain/Chains";
import { FC, Fragment } from "react";
import { UserTx } from "v2/types";
import { classNames } from "v2/utils";
import TxTableRowBody from "./TxTableRowBody";
import TxTableRowHeader from "./TxTableRowHeader";
import TxTableSpacerRow from "./TxTableSpacerRow";

const TxTableBody: FC<{
  txs: UserTx[];
  core: PickleModelJson.PickleModelJson;
  addrs: { [key: string]: string };
}> = ({ txs, core, addrs }) => (
  <>{txs && txs.map((tx) => <TxTableRow key={tx.hash} core={core} tx={tx} addrs={addrs} />)}</>
);

const TxTableRow: FC<{
  tx: UserTx;
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
