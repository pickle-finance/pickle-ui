import { useTranslation } from "next-i18next";
import { PickleModelJson } from "picklefinance-core";
import { FC } from "react";
import { iOffchainVoteData } from "v2/store/offchainVotes";
import ChartContainer from "./MainnetOnlyChartContainer";

const VoteCharts: FC<{
  core: PickleModelJson.PickleModelJson;
  offchainVoteData: iOffchainVoteData | undefined;
}> = ({ core, offchainVoteData }) => {
  const { t } = useTranslation("common");
  return (
    <>
      <h2 className="font-body font-bold text-xl p-4">{t("v2.dill.vote.charts.jarWeight")}</h2>
      <div className="xl:inline-block xl:flex min-w-min gap-4 border border-foreground-alt-500 rounded-xl">
        <ChartContainer core={core} offchainVoteData={offchainVoteData} />
        <ChartContainer core={core} offchainVoteData={offchainVoteData} showTable />
      </div>
    </>
  );
};

export default VoteCharts;
