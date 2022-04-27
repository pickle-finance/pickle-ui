import React, { FC, useState } from "react";
import JarWeightChart from "./JarWeightsPieChart";
import ChainWeightChart from "./ChainWeightPieChart";
import { useTranslation } from "next-i18next";
import { UserData } from "picklefinance-core/lib/client/UserModel";
import { PickleModelJson } from "picklefinance-core";
import { iOffchainVoteData } from "v2/store/offchainVotes";
import ChainSelectSmall from "./ChainSelectSmall";

const ChartContainer: FC<{
  user?: UserData | undefined;
  core?: PickleModelJson.PickleModelJson;
  wallet?: string | undefined | null;
  offchainVoteData?: iOffchainVoteData | undefined;
  isChainWeight?: boolean;
}> = ({ core, offchainVoteData, isChainWeight }) => {
  const { t } = useTranslation("common");
  const [chartChain, setChartChain] = useState({ label: "Ethereum", value: "eth" });
  const pb = isChainWeight ? "pb-20" : "";
  return (
    <div className={`w-full rounded-xl border border-foreground-alt-500 p-4 sm:p-8 mb-10`}>
      <h2 className={`font-body font-bold text-xl ${pb}`}>
        {isChainWeight ? t(`v2.dill.vote.charts.chainWeight`) : t(`v2.dill.vote.charts.jarWeight`)}
      </h2>
      {!isChainWeight && core && (
        <ChainSelectSmall core={core} selectedChain={chartChain} setSelectedChain={setChartChain} />
      )}
      <aside className="h-[450px] px-3 py-10">
        {isChainWeight ? (
          <ChainWeightChart offchainVoteData={offchainVoteData} />
        ) : (
          <JarWeightChart
            chain={chartChain.value}
            core={core}
            offchainVoteData={offchainVoteData}
          />
        )}
      </aside>
    </div>
  );
};

export default ChartContainer;
