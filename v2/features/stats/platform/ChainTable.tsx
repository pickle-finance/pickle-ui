import React, { FC } from "react";
import { PlatformChainData } from "v2/types";
import ChainHead from "./ChainTableHead";
import ChainRow from "./ChainTableRow";

const ChainTable: FC<{ chains: PlatformChainData }> = ({ chains }) => {
  const chainNames: string[] = chains ? Object.keys(chains) : [];
  if (chains)
    return (
      <table>
        <ChainHead />
        <tbody className="border border-foreground-alt-400">
          {chainNames.map((chainName) => (
            <ChainRow key={chainName} chain={chains[chainName]} />
          ))}
        </tbody>
      </table>
    );
  return null;
};

export default ChainTable;
