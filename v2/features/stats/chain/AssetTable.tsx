import { PickleModelJson } from "picklefinance-core";
import { AssetEnablement } from "picklefinance-core/lib/model/PickleModelJson";
import { FC } from "react";
import { ChainAssetData } from "v2/types";
import AssetTableHead from "./AssetTableHead";
import AssetRow from "./AssetTableRow";

const AssetTable: FC<{ assets: ChainAssetData; core: PickleModelJson.PickleModelJson }> = ({
  assets,
  core,
}) => {
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
          return <AssetRow key={key} assetKey={key} asset={assets[key]} />;
        })}
      </tbody>
    </table>
  );
};

export default AssetTable;
