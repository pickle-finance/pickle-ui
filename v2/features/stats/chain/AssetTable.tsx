import { PickleModelJson } from "picklefinance-core";
import { AssetEnablement } from "picklefinance-core/lib/model/PickleModelJson";
import { FC } from "react";
import { ChainAssetData, SetFunction } from "v2/types";
import { ChainSelectData } from "../ChainSelect";
import AssetTableHead from "./AssetTableHead";
import AssetRow from "./AssetTableRow";

const AssetTable: FC<{
  assets: ChainAssetData;
  setJar: SetFunction;
  chain: ChainSelectData;
  core: PickleModelJson.PickleModelJson;
}> = ({ assets, setJar, chain, core }) => {
  let assetKeys: string[] = assets ? Object.keys(assets) : [];
  const activeJarKeys = assetKeys.filter((key) => {
    let thisJar = core.assets.jars.find((j) => j.details?.apiKey === key);
    if (
      thisJar?.enablement !== AssetEnablement.PERMANENTLY_DISABLED &&
      key.slice(-3).toLowerCase() !== "old"
    )
      return key;
  });

  return (
    <table className="w-full">
      <AssetTableHead />
      <tbody className="border border-foreground-alt-400">
        {activeJarKeys.map((key) => {
          return (
            <AssetRow
              key={key}
              assetKey={key}
              asset={assets[key]}
              setJar={setJar}
              core={core}
              chain={chain}
            />
          );
        })}
      </tbody>
    </table>
  );
};

export default AssetTable;
