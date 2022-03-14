import React, { FC } from "react";
import Link from "next/link";
import { PlatformChainData, PlatformChainCoreData } from "v2/types";
import { formatDollars } from "v2/utils";
import { useTranslation } from "next-i18next";


const formatChainLink = (chainId: string): JSX.Element => (
  <Link href={`./stats/chain?chain=${chainId}`}>
    <a className="text-accent-light hover:underline">{chainId.toUpperCase()}</a>
  </Link>
);

const ChainHead: FC = () => {
  const { t } = useTranslation("common");
  return (
    <thead className="rounded-t-md">
      <tr className="w-full border border-foreground-alt-400 bg-foreground-alt-400">
        <th scope="col" className="w-1/5 pt-2 pb-2">
          {t("v2.stats.platform.chainTableHeaders.chain")}
        </th>
        <th scope="col" className="w-1/5 pt-2 pb-2">
          {t("v2.stats.platform.chainTableHeaders.currentRevs")}
        </th>
        <th scope="col" className="w-1/5 pt-2 pb-2">
          {t("v2.stats.platform.chainTableHeaders.revsChange")}
        </th>
        <th scope="col" className="w-1/5 pt-2 pb-2">
          {t("v2.stats.platform.chainTableHeaders.tvl")}
        </th>
        <th scope="col" className="w-1/5 pt-2 pb-2">
          {t("v2.stats.platform.chainTableHeaders.tvlChange")}
        </th>
      </tr>
    </thead>
  );
}

const ChainRow: FC<{ chain: PlatformChainCoreData }> = ({chain}) => (
  <tr className="border border-foreground-alt-400 pt-2 pb-2">
    <td className="text-center pt-2 pb-2">
      {formatChainLink(chain.chainId)}
    </td>
    <td className="text-center pt-2 pb-2">
      {formatDollars(chain.periodRevenue)}
    </td>
    <td className="text-center pt-2 pb-2">
      {formatDollars(chain.periodRevenue - chain.previousPeriodRevenue)}
    </td>
    <td className="text-center pt-2 pb-2">
      {formatDollars(chain.tvl)}
    </td>
    <td className="text-center pt-2 pb-2">
      {formatDollars(chain.tvl - chain.previousTvl)}
    </td>
  </tr>
);

const RenderChainTable: FC<{ chains: PlatformChainData; }> = ({
  chains
}) => {
  const chainNames: string[] = chains ? Object.keys(chains) : [];
  return (
    <table className="w-full">
      <ChainHead />
      <tbody className="border border-foreground-alt-400">
        {chainNames.map((chainName) => (
          <ChainRow key={chainName} chain={chains[chainName]} />
        ))}
      </tbody>
    </table>
  );
};

export const ChainTableContainer: FC<{chains: PlatformChainData}> = ({ chains }) => {
  const { t } = useTranslation("common");
  return (
    <div className="bg-background-light rounded-xl border border-foreground-alt-500 shadow p-4 sm:p-8">
      <h2 className="font-body font-bold text-xl">
        {t("v2.stats.platform.chainTableTitle")}
      </h2>
      <br />
      <RenderChainTable chains={chains} />
    </div>
  );
};
