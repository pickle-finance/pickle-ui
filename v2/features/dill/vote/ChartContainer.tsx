import React, { FC, useState } from "react";
import JarWeightChart from "./JarWeightPieChart";
import ChainWeightChart from "./ChainWeightPieChart";
import { useTranslation } from "next-i18next";
import { UserData } from "picklefinance-core/lib/client/UserModel";
import { PickleModelJson } from "picklefinance-core";
import { iOffchainVoteData } from "v2/store/offchainVotes";
import ChainSelectSmall from "./ChainSelectSmall";
import ChainWeightTable from "./ChainWeightTable";
import JarWeightTable from "./JarWeightTable";

const ChartContainer: FC<{
  user?: UserData | undefined;
  core?: PickleModelJson.PickleModelJson;
  wallet?: string | undefined | null;
  offchainVoteData?: iOffchainVoteData | undefined;
  isChainWeight?: boolean;
}> = ({ core, offchainVoteData, isChainWeight }) => {
  const { t } = useTranslation("common");
  const [chartChain, setChartChain] = useState({ label: "Ethereum", value: "eth" });
  const [showChainTable, setShowChainTable] = useState(false);
  const [showJarTable, setShowJarTable] = useState(false);

  return (
    <div className={`w-full rounded-xl border border-foreground-alt-500 p-4 sm:p-8 mb-10`}>
      {isChainWeight ? (
        <>
          <h2 className={`font-body font-bold text-xl`}>{t(`v2.dill.vote.charts.chainWeight`)}</h2>
          <TableSwitch showTable={showChainTable} setShowTable={setShowChainTable} />
        </>
      ) : (
        <>
          <h2 className={`font-body font-bold text-xl`}>{t(`v2.dill.vote.charts.jarWeight`)}</h2>
          <TableSwitch showTable={showJarTable} setShowTable={setShowJarTable} />
        </>
      )}

      {!isChainWeight && core && (
        <ChainSelectSmall core={core} selectedChain={chartChain} setSelectedChain={setChartChain} />
      )}
      <aside className="h-[450px] w-full px-3 py-10">
        {isChainWeight ? (
          <>
            {!showChainTable ? (
              <ChainWeightChart offchainVoteData={offchainVoteData} />
            ) : (
              <ChainWeightTable offchainVoteData={offchainVoteData} />
            )}
          </>
        ) : (
          <>
            {!showJarTable ? (
              <JarWeightChart
                chain={chartChain.value}
                core={core}
                offchainVoteData={offchainVoteData}
              />
            ) : (
              <JarWeightTable
                core={core}
                offchainVoteData={offchainVoteData}
                chain={chartChain.value}
              />
            )}
          </>
        )}
      </aside>
    </div>
  );
};

const TableSwitch: FC<{ showTable: boolean; setShowTable: Function }> = ({
  showTable,
  setShowTable,
}) => {
  return (
    <a className="cursor-pointer text-accent" onClick={() => setShowTable(!showTable)}>
      {showTable ? "Show Chart" : "Show Table"}
    </a>
  );
};

export default ChartContainer;
