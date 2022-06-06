import React, { FC } from "react";
import { useSelector } from "react-redux";
import { Network } from "v2/features/connection/networks";
import { CoreSelectors } from "v2/store/core";
import { PlatformChainData, SetFunction } from "v2/types";
import ChainHead from "./ChainTableHead";
import ChainRow from "./ChainTableRow";

const ChainTable: FC<{ chains: PlatformChainData; setChain: SetFunction }> = ({
  chains,
  setChain,
}) => {
  const networks: Network[] = useSelector(CoreSelectors.selectNetworks);
  const chainNames: string[] = chains ? Object.keys(chains) : [];
  if (chains)
    return (
      <table className="w-full">
        <ChainHead />
        <tbody className="border border-foreground-alt-400">
          {chainNames.map((chainName) => (
            <ChainRow
              key={chainName}
              chain={chains[chainName]}
              setChain={setChain}
              networks={networks}
            />
          ))}
        </tbody>
      </table>
    );
  return null;
};

export default ChainTable;
