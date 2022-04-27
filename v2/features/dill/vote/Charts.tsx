import { PickleModelJson } from "picklefinance-core";
import { FC } from "react";
import { iOffchainVoteData } from "v2/store/offchainVotes";
import ChartContainer from "./ChartContainer";

const VoteCharts: FC<{
  core: PickleModelJson.PickleModelJson;
  offchainVoteData: iOffchainVoteData | undefined;
}> = ({ core, offchainVoteData }) => (
  <div className="w-full inline-grid grid-cols-2 gap-4">
    <ChartContainer core={core} offchainVoteData={offchainVoteData} isChainWeight={true} />
    <ChartContainer core={core} offchainVoteData={offchainVoteData} />
  </div>
);

export default VoteCharts;
