import Link from "next/link";
import { FC } from "react";
import { PlatformChainCoreData } from "v2/types";
import { formatDollars } from "v2/utils";

const ChainRow: FC<{ chain: PlatformChainCoreData }> = ({ chain }) => (
  <tr className="border border-foreground-alt-400">
    <td className="text-left text-sm lg:pl-8 sm:pl-4 py-2 pr-2">
      {formatChainLink(chain.chainId)}
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

const formatChainLink = (chainId: string): JSX.Element => (
  <Link href={`./stats/chain?chain=${chainId}`}>
    <a className="text-accent-light hover:underline">{chainId.toUpperCase()}</a>
  </Link>
);

export default ChainRow;
