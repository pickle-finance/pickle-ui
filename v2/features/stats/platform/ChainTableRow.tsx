import Link from "next/link";
import { FC } from "react";
import { PlatformChainCoreData } from "v2/types";
import { formatDollars } from "v2/utils";

const ChainRow: FC<{ chain: PlatformChainCoreData }> = ({ chain }) => (
  <tr className="border border-foreground-alt-400 pt-2 pb-2">
    <td className="text-center pt-2 pb-2">{formatChainLink(chain.chainId)}</td>
    <td className="text-center pt-2 pb-2">{formatDollars(chain.periodRevenue)}</td>
    <td className="text-center pt-2 pb-2">
      {formatDollars(chain.periodRevenue - chain.previousPeriodRevenue)}
    </td>
    <td className="text-center pt-2 pb-2">{formatDollars(chain.tvl)}</td>
    <td className="text-center pt-2 pb-2">{formatDollars(chain.tvl - chain.previousTvl)}</td>
  </tr>
);

const formatChainLink = (chainId: string): JSX.Element => (
  <Link href={`./stats/chain?chain=${chainId}`}>
    <a className="text-accent-light hover:underline">{chainId.toUpperCase()}</a>
  </Link>
);

export default ChainRow;
