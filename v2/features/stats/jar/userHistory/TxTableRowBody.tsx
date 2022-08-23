import { FC } from "react";
import { UserTransfer } from "v2/types";
import { formatNumber } from "v2/utils";

const TxTableRowBody: FC<{ transfers: UserTransfer[]; addrs: { [key: string]: string } }> = ({
  transfers,
  addrs,
}) => (
  <td
    colSpan={6}
    className="bg-background-light rounded-b-xl p-6 border-t border-foreground-alt-500"
  >
    <div className="flex justify-evenly">
      <div className="py-2 flex-shrink-0 mr-6">
        {transfers.map((t) => (
          <p className="text-foreground-alt-200" key={t.log_index}>
            {transferToString(t, addrs)}
          </p>
        ))}
      </div>
    </div>
  </td>
);

const transferToString = (transfer: UserTransfer, addrs: { [key: string]: string }) => {
  const fromAddr =
    addrs[transfer.fromAddress] ||
    transfer.fromAddress.slice(0, 5) + "..." + transfer.fromAddress.slice(-3);
  const toAddr =
    addrs[transfer.toAddress] ||
    transfer.toAddress.slice(0, 5) + "..." + transfer.toAddress.slice(-3);

  const burned = toAddr === "Null";
  const minted = fromAddr === "Null";
  const nTokens =
    transfer.price && transfer.value
      ? formatNumber(+transfer.price / transfer.value, 8)
      : "an unknown number of";
  const value = transfer.value ? "(" + formatNumber(transfer.value, 2) + " USD)" : "";
  return burned
    ? `${fromAddr} burned ${nTokens} tokens ${value}`
    : minted
    ? `${nTokens} ${value} were minted and sent to ${toAddr}`
    : `${fromAddr} sent ${nTokens} tokens ${value} to ${toAddr}`;
};

export default TxTableRowBody;
