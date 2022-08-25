import { ChevronDownIcon } from "@heroicons/react/solid";
import { PickleModelJson } from "picklefinance-core";
import { FC, HTMLAttributes } from "react";
import { UserTx } from "v2/types";
import { classNames, formatDate } from "v2/utils";
import Link from "v2/components/Link";

const TxTableRowHeader: FC<{
  tx: UserTx;
  core: PickleModelJson.PickleModelJson;
  open: boolean;
}> = ({ tx, core, open }) => {
  const chain = core.chains.find((c) => c.chainId == tx.chain_id);
  const txLinkUrl = `${chain?.explorer}/tx/${tx.hash}`;
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
        <Link href={txLinkUrl} external primary className="font-bold ml-1">
          {tx.hash.slice(0, 5) + "..." + tx.hash.slice(-3)}
        </Link>
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

export default TxTableRowHeader;
