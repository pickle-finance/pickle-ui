import { FC } from "react";
import { ChainAssetData } from "v2/types";
import AssetTableHead from "./AssetTableHead";
import AssetRow from "./AssetTableRow";

const AssetTable: FC<{ assets: ChainAssetData }> = ({ assets }) => {
  const assetKeys: string[] = assets ? Object.keys(assets) : [];
  return (
    <table className="w-full">
      <AssetTableHead />
      <tbody className="border border-foreground-alt-400">
        {assetKeys.map((key) => (
          <AssetRow key={key} assetKey={key} asset={assets[key]} />
        ))}
      </tbody>
    </table>
  );
};

export default AssetTable;
