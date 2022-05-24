import React, { FC } from "react";
import { PickleModelJson } from "picklefinance-core";
import { iOffchainVoteData } from "v2/store/offchainVotes";

import JarWeightChart from "./JarWeightPieChart";
import JarWeightTable from "./JarWeightTable";

const ChartContainer: FC<{
  core?: PickleModelJson.PickleModelJson;
  offchainVoteData?: iOffchainVoteData | undefined;
  showTable?: boolean;
}> = ({ core, offchainVoteData, showTable }) => {
  return (
    <div className={`grid grid-rows-7 w-full min-w-min min-h-min rounded-xl p-4 sm:p-8 mb-10`}>
      <aside className="sm:h-[200px] md:h-[300px] lg:h-[400px] xl:h-[500px] w-full row-auto px-3 py-10">
        <>
          {!showTable ? (
            <JarWeightChart chain={"eth"} core={core} offchainVoteData={offchainVoteData} />
          ) : (
            <JarWeightTable chain={"eth"} core={core} offchainVoteData={offchainVoteData} />
          )}
        </>
      </aside>
    </div>
  );
};

export default ChartContainer;
