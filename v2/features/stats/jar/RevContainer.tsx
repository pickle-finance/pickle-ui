import { PickleModelJson } from "picklefinance-core";
import React, { FC } from "react";
import Link from "next/link";
import { AssetRevs, RecentHarvest, Transfer } from "./types";
import { formatDollars, formatDate } from "v2/utils";
import { useTranslation } from "next-i18next";

const sumHarvestTransfers = (transfers: Transfer[]): number => {
  let sum = 0;
  transfers.forEach((x) => (sum = sum + x.usdval));
  return sum;
};

const getChainExplorer = (
  revs: AssetRevs,
  pfCore: PickleModelJson.PickleModelJson,
): string => {
  if (revs.recentHarvests.length > 0) {
    const jarKey = revs.recentHarvests[0].jarKey;
    const chain =
      pfCore && pfCore.assets && pfCore.assets.jars
        ? pfCore.assets.jars.filter(
            (x) => x.details && x.details.apiKey === jarKey,
          )[0].chain
        : "";
    const chainExplorer =
      pfCore && pfCore.chains
        ? pfCore.chains.filter((x) => x.network === chain)[0].explorer
        : "";
    return chainExplorer;
  }
  return "";
};

const formatTxLink = (chainExplorer: string, txid: string): JSX.Element => (
  <Link href={`${chainExplorer}/tx/${txid}`}>
    <a
      target="_blank"
      rel="noreferrer"
      className="text-accent-light hover:underline"
    >
      {txid.substring(0, 10) + "..."}
    </a>
  </Link>
);

const RevHead: FC = () => {
  const { t } = useTranslation("common");
  return (
    <thead className="rounded-t-md">
      <tr className="w-full border border-foreground-alt-400 bg-slate-600">
        <th scope="col" className="w-1/3 pt-2 pb-2">
          {t("v2.stats.jar.revsTableHeaders.date")}
        </th>
        <th scope="col" className="w-1/3 pt-2 pb-2">
          {t("v2.stats.jar.revsTableHeaders.txLink")}
        </th>
        <th scope="col" className="w-1/3 pt-2 pb-2">
          {t("v2.stats.jar.revsTableHeaders.value")}
        </th>
      </tr>
    </thead>
  );
};

const RevRow: FC<{ recentHarvest: RecentHarvest; chainExplorer: string }> = ({
  recentHarvest,
  chainExplorer,
}) => (
  <tr className="border border-foreground-alt-400 pt-2 pb-2">
    <td className="text-center pt-2 pb-2">
      {recentHarvest.timestamp &&
        formatDate(
          // this condition was added in POC because of sec vs millisec inconsistancy
          // this may not be necessary in the future
          new Date(
            recentHarvest.timestamp > 10 ** 12
              ? recentHarvest.timestamp
              : recentHarvest.timestamp * 1000,
          ),
        )}
    </td>
    <td className="text-center pt-2 pb-2">
      {recentHarvest.transfers &&
        formatTxLink(chainExplorer, recentHarvest.txid)}
    </td>
    <td className="text-center pt-2 pb-2">
      {recentHarvest.transfers &&
        formatDollars(sumHarvestTransfers(recentHarvest.transfers))}
    </td>
  </tr>
);

const RenderRevs: FC<{ revs: AssetRevs; chainExplorer: string }> = ({
  revs,
  chainExplorer,
}) => {
  return (
    <table className="w-full">
      <RevHead />
      <tbody className="border border-foreground-alt-400">
        {revs.recentHarvests[0] && (
          <RevRow
            recentHarvest={revs.recentHarvests[0]}
            chainExplorer={chainExplorer}
          />
        )}
        {revs.recentHarvests[1] && (
          <RevRow
            recentHarvest={revs.recentHarvests[1]}
            chainExplorer={chainExplorer}
          />
        )}
        {revs.recentHarvests[2] && (
          <RevRow
            recentHarvest={revs.recentHarvests[2]}
            chainExplorer={chainExplorer}
          />
        )}
        {revs.recentHarvests[3] && (
          <RevRow
            recentHarvest={revs.recentHarvests[3]}
            chainExplorer={chainExplorer}
          />
        )}
        {revs.recentHarvests[4] && (
          <RevRow
            recentHarvest={revs.recentHarvests[4]}
            chainExplorer={chainExplorer}
          />
        )}
      </tbody>
    </table>
  );
};

export const RevContainer: FC<{
  revs: AssetRevs;
  pfCore: PickleModelJson.PickleModelJson;
}> = ({ revs, pfCore }) => {
  const { t } = useTranslation("common");
  const chainExplorer: string = pfCore ? getChainExplorer(revs, pfCore) : "";
  return (
    <div className="bg-background-light rounded-xl border border-foreground-alt-500 shadow p-4 sm:p-8">
      <h2 className="font-body font-bold text-xl">
        {t("v2.stats.jar.revsTableTitle")}
      </h2>
      <br />
      <RenderRevs revs={revs} chainExplorer={chainExplorer} />
    </div>
  );
};
