import { FC } from "react";
import RevHead from "./RevTableHead";
import RevRow from "./RevTableRow";
import { AssetRevs } from "v2/types";

const RevTable: FC<{ revs: AssetRevs; chainExplorer: string }> = ({ revs, chainExplorer }) => {
  return (
    <table className="w-full">
      <RevHead />
      <tbody className="border border-foreground-alt-400">
        {revs.recentHarvests[0] && (
          <RevRow recentHarvest={revs.recentHarvests[0]} chainExplorer={chainExplorer} />
        )}
        {revs.recentHarvests[1] && (
          <RevRow recentHarvest={revs.recentHarvests[1]} chainExplorer={chainExplorer} />
        )}
        {revs.recentHarvests[2] && (
          <RevRow recentHarvest={revs.recentHarvests[2]} chainExplorer={chainExplorer} />
        )}
        {revs.recentHarvests[3] && (
          <RevRow recentHarvest={revs.recentHarvests[3]} chainExplorer={chainExplorer} />
        )}
        {revs.recentHarvests[4] && (
          <RevRow recentHarvest={revs.recentHarvests[4]} chainExplorer={chainExplorer} />
        )}
      </tbody>
    </table>
  );
};

export default RevTable;
