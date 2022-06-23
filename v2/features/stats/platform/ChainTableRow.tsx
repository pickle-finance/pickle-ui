import { FC } from "react";
import { Network } from "v2/features/connection/networks";
import { PlatformChainCoreData, SetFunction } from "v2/types";
import { formatDollars } from "v2/utils";
import { networksToOptions } from "../ChainSelect";

const ChainRow: FC<{
  chain: PlatformChainCoreData;
  setChain: SetFunction;
  networks: Network[];
}> = ({ chain, setChain, networks }) => (
  <tr className="border border-foreground-alt-400 text-foreground-alt-100">
    <td className="text-left text-sm lg:pl-8 sm:pl-4 py-2 pr-2">
      <ChainControl chainId={chain.chainId} setChain={setChain} networks={networks} />
    </td>
    <td className="text-left text-sm p-2">{formatDollars(chain.periodRevenue)}</td>
    <td className="text-left text-sm p-2">
      {formatDollars(chain.periodRevenue - chain.previousPeriodRevenue)}
    </td>
    <td className="text-left text-sm p-2">{formatDollars(chain.tvl)}</td>
    <td className="text-left text-sm py-2 pl-2 lg:pr-8 sm:pr-4">
      {formatDollars(chain.tvl - chain.previousTvl)}
    </td>
  </tr>
);

const ChainControl: FC<{ chainId: string; setChain: SetFunction; networks: Network[] }> = ({
  chainId,
  setChain,
  networks,
}) => {
  const options = networksToOptions(networks);
  const thisNetwork = options.find((n) => n.value === chainId);

  if (thisNetwork)
    return (
      <a
        className="text-accent-light cursor-pointer hover:underline"
        onClick={() => setChain(thisNetwork)}
      >
        {thisNetwork.label.toUpperCase()}
      </a>
    );
  return (
    <a className="text-accent-light cursor-pointer hover:underline">{chainId.toUpperCase()}</a>
  );
};

export default ChainRow;
