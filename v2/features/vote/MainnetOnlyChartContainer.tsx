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
    <div className="w-full h-[500px] grid place-items-center p-5">
      {!showTable ? (
        <JarWeightChart chain={"eth"} core={core} offchainVoteData={offchainVoteData} />
      ) : (
        <JarWeightTable chain={"eth"} core={core} offchainVoteData={offchainVoteData} />
      )}
    </div>
  );
};

export default ChartContainer;
