import React, { FC } from "react";
import Link from "next/link";
import { formatDollars } from "v2/utils";
import { AssetChangeData, AssetData } from "./types";
import { useTranslation } from "next-i18next";

const formatAssetLink = (jarKey: string): JSX.Element => (
  <Link href={`./jar?jar=${jarKey}`}>
    <a className="text-accent-light hover:underline">{jarKey.toUpperCase()}</a>
  </Link>
);

const ChainHead: FC = () => {
  const { t } = useTranslation("common");
  return (
    <thead className="rounded-t-md">
      <tr className="w-full border border-foreground-alt-400 bg-foreground-alt-400">
        <th scope="col" className="w-1/4 pt-2 pb-2">
          {t("v2.stats.chain.assetTableHeaders.asset")}
        </th>
        <th scope="col" className="w-1/4 pt-2 pb-2">
          {t("v2.stats.chain.assetTableHeaders.tvl")}
        </th>
        <th scope="col" className="w-1/4 pt-2 pb-2">
          {t("v2.stats.chain.assetTableHeaders.tvlChange")}
        </th>
        <th scope="col" className="w-1/4 pt-2 pb-2">
          {t("v2.stats.chain.assetTableHeaders.apyRange")}
        </th>
      </tr>
    </thead>
  );
};

const AssetRow: FC<{ assetKey: string; asset: AssetChangeData }> = ({
  assetKey,
  asset,
}) => {
  const assetApyMin =
    asset && asset.now && asset.now.jarApy && asset.now.farmMinApy
      ? (asset.now.jarApy + asset.now.farmMinApy).toFixed(3)
      : undefined;
  const assetApyMax =
    asset && asset.now && asset.now.jarApy && asset.now.farmMaxApy
      ? (asset.now.jarApy + asset.now.farmMaxApy).toFixed(3)
      : undefined;
  const apyRangeString =
    assetApyMin && assetApyMax ? `${assetApyMin} - ${assetApyMax}%` : "-";
  return (
    <tr className="border border-foreground-alt-400 pt-2 pb-2">
      <td className="text-center pt-2 pb-2">
        {formatAssetLink(assetKey.toLowerCase())}
      </td>
      <td className="text-center pt-2 pb-2">
        {asset && asset.now ? formatDollars(asset.now.value) : "-"}
      </td>
      <td className="text-center pt-2 pb-2">
        {asset && asset.now ? formatDollars(asset.now.value - asset.previous.value) : "-"}
      </td>
      <td className="text-center pt-2 pb-2">{apyRangeString}</td>
    </tr>
  );
};

const RenderAssetTable: FC<{ assets: AssetData }> = ({ assets }) => {
  const assetKeys: string[] = assets ? Object.keys(assets) : [];
  return (
    <table className="w-full">
      <ChainHead />
      <tbody className="border border-foreground-alt-400">
        {assetKeys.map((key) => (
          <AssetRow key={key} assetKey={key} asset={assets[key]} />
        ))}
      </tbody>
    </table>
  );
};

export const AssetTableContainer: FC<{ assets: AssetData }> = ({ assets }) => {
  const { t } = useTranslation("common");
  return (
    <div className="bg-background-light rounded-xl border border-foreground-alt-500 shadow p-4 sm:p-8">
      <h2 className="font-body font-bold text-xl">
        {t("v2.stats.chain.assetTableTitle")}
      </h2>
      <br />
      <RenderAssetTable assets={assets} />
    </div>
  );
};
