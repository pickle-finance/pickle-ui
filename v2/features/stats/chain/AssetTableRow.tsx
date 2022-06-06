import Link from "next/link";
import { FC } from "react";
import { AssetChangeData } from "v2/types";
import { formatDollars } from "v2/utils";

const AssetRow: FC<{
  assetKey: string;
  asset: AssetChangeData;
}> = ({ assetKey, asset }) => {
  const assetApyMin =
    asset && asset.now && asset.now.jarApy && asset.now.farmMinApy
      ? (asset.now.jarApy + asset.now.farmMinApy).toFixed(3)
      : undefined;
  const assetApyMax =
    asset && asset.now && asset.now.jarApy && asset.now.farmMaxApy
      ? (asset.now.jarApy + asset.now.farmMaxApy).toFixed(3)
      : undefined;
  const apyRangeString =
    assetApyMin && assetApyMax
      ? assetApyMin !== assetApyMax
        ? `${assetApyMin} - ${assetApyMax}%`
        : `${assetApyMax}%`
      : asset.now.jarApr
      ? `${asset.now.jarApr}%`
      : "0%";
  return (
    <tr className="border border-foreground-alt-400">
      <td className="text-left text-sm lg:pl-8 sm:pl-4 py-2 pr-2">
        {formatAssetLink(assetKey.toLowerCase())}
      </td>
      <td className="text-left text-sm p-2">
        {asset && asset.now ? formatDollars(asset.now.value) : "-"}
      </td>
      <td className="text-left text-sm p-2">
        {asset && asset.now ? formatDollars(asset.now.value - asset.previous.value) : "-"}
      </td>
      <td className="text-left text-sm py-2 pl-2 lg:pr-8 sm:pr-4">{apyRangeString}</td>
    </tr>
  );
};

const formatAssetLink = (jarKey: string): JSX.Element => (
  <Link href={`./jar?jar=${jarKey}`}>
    <a className="text-accent-light hover:underline">{jarKey.toUpperCase()}</a>
  </Link>
);

export default AssetRow;
