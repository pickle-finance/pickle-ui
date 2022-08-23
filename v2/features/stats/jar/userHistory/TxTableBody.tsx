import { Disclosure, Transition } from "@headlessui/react";
import { FC, Fragment } from "react";
import { UserTx } from "v2/types";
import { classNames } from "v2/utils";
import TxTableRowBody from "./TxTableRowBody";
import TxTableRowHeader from "./TxTableRowHeader";
import TxTableSpacerRow from "./TxTableSpacerRow";

const TxTableBody: FC<{ txs: UserTx[]; addrs: { [key: string]: string } }> = ({ txs, addrs }) => (
  <>{txs && txs.map((tx) => <TxTableRow key={tx.hash} tx={tx} addrs={addrs} />)}</>
);

const TxTableRow: FC<{ tx: UserTx; addrs: { [key: string]: string } }> = ({ tx, addrs }) => (
  <>
    <Disclosure as={Fragment}>
      {({ open }) => (
        <>
          <Disclosure.Button
            as="tr"
            // No hover state when the row is expaned.
            className={classNames(!open && "group", "cursor-pointer")}
          >
            <TxTableRowHeader tx={tx} open={open} />
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
              <TxTableRowBody transfers={tx.transfers} addrs={addrs} />
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
    <TxTableSpacerRow />
  </>
);

export default TxTableBody;
