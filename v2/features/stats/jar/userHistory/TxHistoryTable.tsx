import { Disclosure, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { useTranslation } from "next-i18next";
import Link from "v2/components/Link";
import { FC, Fragment, HTMLAttributes } from "react";
import { UserTransfer, UserTx } from "v2/types";
import { classNames, formatDate } from "v2/utils";

const TxHistoryTable: FC<{ txHistory: UserTx[]; className?: string }> = ({
  txHistory,
  className,
}) => (
  <div className={classNames("flex flex-col", className)}>
    <div className="-my-2 overflow-x-auto">
      <div className="py-2 align-middle inline-block min-w-full">
        <table className="min-w-full table-auto border-collapse">
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
            <TxTableBody txs={txHistory} />
          </tbody>
        </table>
        {/* <div className="flex justify-center mt-4">
          <Pagination />
        </div> */}
      </div>
    </div>
  </div>
);

const TxTableHeaderCell: FC<{ label: string }> = ({ label }) => (
  <th
    scope="col"
    className="px-4 py-1 h-8 text-left text-xs font-bold text-foreground-alt-200 tracking-normal sm:px-6"
  >
    {label}
  </th>
);

const TxTableBody: FC<{ txs: UserTx[] }> = ({ txs }) => (
  <>{txs && txs.map((tx) => <TxTableRow key={tx.hash} tx={tx} />)}</>
);

const TxTableRow: FC<{ tx: UserTx }> = ({ tx }) => (
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
            <Disclosure.Panel>
              <TransferTable transfers={tx.transfers} />
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
    <TxTableSpacerRow />
  </>
);

const TxTableRowHeader: FC<{ tx: UserTx; open: boolean }> = ({ tx, open }) => {
  const { t } = useTranslation("common");

  return (
    <>
      <RowCell className={classNames(!open && "rounded-bl-xl", "rounded-tl-xl flex items-center")}>
        <p className="font-title font-medium text-base leading-5 text-foreground-alt-200">
          {formatDate(new Date(tx.timestamp * 1000))}
        </p>
      </RowCell>
      <RowCell>
        <p className="font-title font-medium text-base leading-5 text-foreground-alt-200">
          {tx.blocknumber}
        </p>
      </RowCell>
      <RowCell>
        <div className="flex items-center">
          <div className="ml-2">
            <p className="font-title font-medium text-base leading-5 text-foreground-alt-200">
              {tx.transaction_type}
            </p>
          </div>
        </div>
      </RowCell>
      <RowCell>
        <p
          className={classNames(
            "font-title font-medium text-base leading-5 text-foreground-alt-200",
          )}
        >
          {tx.hash}
        </p>
      </RowCell>
      <RowCell className={classNames(!open && "rounded-br-xl", "rounded-tr-xl w-10")}>
        <div className="flex justify-end pr-3">
          <ChevronDownIcon
            className={classNames(
              open && "rotate-180",
              "text-foreground ml-2 h-5 w-5 transition duration-300 ease-in-out",
            )}
            aria-hidden="true"
          />
        </div>
      </RowCell>
    </>
  );
};

const TransferTable: FC<{ transfers: UserTransfer[] }> = ({ transfers }) => (
  <div className="py-2 align-middle inline-block min-w-full">
    <table className="min-w-full table-auto border-collapse">
      <tbody>
        {transfers.map((t) => (
          <tr
            key={t.log_index}
            className="bg-background-light rounded-b-xl p-6 border-t border-foreground-alt-500"
          >
            <td>
              <p className="font-normal text-xs text-foreground-alt-200 mb-6">{t.transfer_type}</p>
            </td>
            <td>
              <Link href="http://www.google.com" className="font-bold" external primary>
                {t.fromAddress.substring(0, 8) + "..."}
              </Link>
            </td>
            <td>
              <Link href="http://www.google.com" className="font-bold" external primary>
                {t.toAddress.substring(0, 8) + "..."}
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const RowCell: FC<HTMLAttributes<HTMLElement>> = ({ children, className }) => (
  <td
    className={classNames(
      "bg-background-light p-4 whitespace-nowrap text-sm text-foreground sm:p-6 group-hover:bg-background-lightest transition duration-300 ease-in-out",
      className,
    )}
  >
    {children}
  </td>
);

const TxTableSpacerRow: FC = () => {
  return (
    <tr>
      <td colSpan={5} className="bg-background p-1"></td>
    </tr>
  );
};

export default TxHistoryTable;
