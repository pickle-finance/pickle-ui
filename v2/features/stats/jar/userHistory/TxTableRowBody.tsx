import { PickleModelJson } from "picklefinance-core";
import { RawChain } from "picklefinance-core/lib/chain/Chains";
import { FC } from "react";
import { UserTransfer } from "v2/types";
import { formatNumber } from "v2/utils";
import Link from "v2/components/Link";
import { BigNumber } from "ethers";

const TxTableRowBody: FC<{
  transfers: UserTransfer[];
  core: PickleModelJson.PickleModelJson;
  chain: RawChain;
  addrs: { [key: string]: string };
}> = ({ transfers, core, chain, addrs }) => (
  <td
    colSpan={6}
    className="bg-background-light rounded-b-xl p-2 border-t border-foreground-alt-500"
  >
    <div className="flex justify-evenly">
      <div className="py-2 flex-shrink-0 mr-6">
        {transfers.map((t) => (
          <TransferDescription
            key={t.log_index}
            transfer={t}
            core={core}
            chain={chain}
            tmpAddrs={addrs}
          />
        ))}
      </div>
    </div>
  </td>
);

const TransferDescription: FC<{
  transfer: UserTransfer;
  core: PickleModelJson.PickleModelJson;
  chain: RawChain;
  tmpAddrs: { [addr: string]: string };
}> = ({ transfer, core, chain, tmpAddrs }) => {
  const {
    fromAddr,
    toAddr,
    burned,
    minted,
    nTokens,
    nGwei,
    useGwei,
    value,
    tokenName,
  } = transferData(transfer, core, tmpAddrs);
  const useFromLink = fromAddr.includes("...") && chain !== undefined;
  const useToLink = toAddr.includes("...") && chain !== undefined;
  const nTokensString = useGwei
    ? `${nGwei} Gwei of ${tokenName} tokens`
    : `${nTokens}${" " + tokenName} tokens`;
  return (
    <>
      {burned && (
        <p className="text-sm text-foreground-alt-200">{`${nTokensString} ${value} were burned.`}</p>
      )}
      {minted && (
        <>
          {useToLink ? (
            <span className="whitespace-nowrap flex">
              <p className="text-sm text-foreground-alt-200">
                {`${nTokensString} ${value} were minted and sent to`}
              </p>
              <AddrLink
                chain={chain}
                addr={toAddr}
                linkAddr={transfer.toAddress}
                className="pl-1"
              />
            </span>
          ) : (
            <p className="text-sm text-foreground-alt-200">
              {`${nTokensString} ${value} were minted and sent to ${toAddr}`}
            </p>
          )}
        </>
      )}
      {!minted && !burned && (
        <>
          {useFromLink && useToLink && (
            <div className="flex inline whitespace-nowrap">
              <AddrLink
                chain={chain}
                addr={fromAddr}
                linkAddr={transfer.fromAddress}
                className="pr-1"
              />
              <p className="text-sm pl-1 text-foreground-alt-200">
                {`sent ${nTokensString} ${value} to `}
              </p>
              <AddrLink
                chain={chain}
                addr={toAddr}
                linkAddr={transfer.toAddress}
                className="pl-1"
              />
            </div>
          )}
          {useFromLink && !useToLink && (
            <div className="flex inline whitespace-nowrap align-center">
              <AddrLink
                chain={chain}
                addr={fromAddr}
                linkAddr={transfer.fromAddress}
                className="pr-1"
              />
              <p className="text-sm pl-1 text-foreground-alt-200">
                {`sent ${nTokensString} ${value} to ${toAddr}`}
              </p>
            </div>
          )}
          {!useFromLink && useToLink && (
            <div className="flex inline whitespace-nowrap">
              <p className="text-sm text-foreground-alt-200">
                {`${fromAddr} sent ${nTokensString} ${value} to`}
              </p>
              <AddrLink
                chain={chain}
                addr={toAddr}
                linkAddr={transfer.toAddress}
                className="pl-1"
              />
            </div>
          )}
          {!useFromLink && !useToLink && (
            <p className="text-sm text-foreground-alt-200">
              {`${fromAddr} sent ${nTokensString} ${value} to ${toAddr}`}
            </p>
          )}
        </>
      )}
    </>
  );
};

const AddrLink: FC<{ chain: RawChain; addr: string; linkAddr: string; className?: string }> = ({
  chain,
  addr,
  linkAddr,
  className,
}) => (
  <Link href={`${chain.explorer}/address/${linkAddr}`} external primary className={className}>
    {addr}
  </Link>
);

const transferData = (
  transfer: UserTransfer,
  core: PickleModelJson.PickleModelJson,
  addrs: { [addr: string]: string },
) => {
  const tmp = core && coreToAddrMap(core);
  addrs = tmp && { ...tmp, ...addrs };
  const fromAddr =
    addrs[transfer.fromAddress.toLowerCase()] ||
    transfer.fromAddress.slice(0, 5) + "..." + transfer.fromAddress.slice(-3);
  const toAddr =
    addrs[transfer.toAddress.toLowerCase()] ||
    transfer.toAddress.slice(0, 5) + "..." + transfer.toAddress.slice(-3);
  const burned = toAddr === "Null";
  const minted = fromAddr === "Null";
  const nTokens =
    transfer.price && transfer.value
      ? transfer.value / +transfer.price < 1
        ? formatNumber(transfer.value / +transfer.price, 6)
        : formatNumber(transfer.value / +transfer.price, 2)
      : "unknown";
  const nGwei = formatNumber(BigNumber.from(transfer.amount).div(1e9).toNumber());
  const useGwei = nTokens === "unknown";

  const value = transfer.value ? "(" + formatNumber(transfer.value, 2) + " USD)" : "";
  const tokenName = addrs[transfer.tokenAddress.toLowerCase()] || "";
  return {
    addrs: addrs,
    fromAddr: fromAddr,
    toAddr: toAddr,
    burned: burned,
    minted: minted,
    nTokens: nTokens,
    nGwei: nGwei,
    useGwei: useGwei,
    value: value,
    tokenName: tokenName,
  };
};

const coreToAddrMap = (core: PickleModelJson.PickleModelJson) => {
  let addrs: { [addr: string]: string } = {};
  core.assets.jars.forEach((a) => {
    const depositTokenAddr = a.depositToken.addr.toLowerCase();
    const depositTokenName = a.depositToken.name;
    const pTokenAddr = a.contract.toLowerCase();
    const pTokenName = "p" + depositTokenName;
    addrs[depositTokenAddr] = depositTokenName;
    addrs[pTokenAddr] = pTokenName;
  });
  core.tokens.forEach((t) => {
    const tokenAddr = t.contractAddr.toLowerCase();
    const tokenName = t.name ? t.name : t.id;
    addrs[tokenAddr] = tokenName;
  });
  return addrs;
};

export default TxTableRowBody;
