import Link from "next/link";
import { PickleModelJson } from "picklefinance-core";
import { JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";
import { FC } from "react";
import { AssetChangeData, SetFunction } from "v2/types";
import { formatDollars } from "v2/utils";
import { ChainSelectData } from "../ChainSelect";
import { coreToOptions } from "../JarSelect";

const AssetRow: FC<{
  assetKey: string;
  asset: AssetChangeData;
  setJar: SetFunction;
  core: PickleModelJson.PickleModelJson | undefined;
  chain: ChainSelectData;
}> = ({ assetKey, asset, setJar, core, chain }) => {
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
    <tr className="border border-foreground-alt-400 text-foreground-alt-100">
      <td className="text-left text-sm lg:pl-8 sm:pl-4 py-2 pr-2">
        <JarControl jarKey={assetKey} setJar={setJar} chain={chain} core={core} />
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

const JarControl: FC<{
  jarKey: string;
  setJar: SetFunction;
  chain: ChainSelectData;
  core: PickleModelJson.PickleModelJson | undefined;
}> = ({ jarKey, setJar, chain, core }) => {
  const options = coreToOptions(core, chain);
  const thisJar = options.find((j) => j.value === jarKey);

  if (thisJar)
    return (
      <a
        className="text-accent-light cursor-pointer hover:underline"
        onClick={() => setJar(thisJar)}
      >
        {thisJar.label.toUpperCase()}
      </a>
    );
  return <a className="text-accent-light cursor-pointer hover:underline">{jarKey.toUpperCase()}</a>;
};

export default AssetRow;
