import { useTranslation } from "next-i18next";
import { PickleModelJson } from "picklefinance-core";
import { FC, HTMLAttributes } from "react";
import { iOffchainVoteData } from "v2/store/offchainVotes";
import { classNames, formatPercentage } from "v2/utils";

const ChainWeightTable: FC<{
  offchainVoteData: iOffchainVoteData | undefined;
  core: PickleModelJson.PickleModelJson | undefined;
}> = ({ offchainVoteData, core }) => {
  const tableData = getPlatformChainWeights(offchainVoteData);
  return (
    <div className="flex flex-col h-full max-w-full">
      <div className="-my-2 overflow-x-auto">
        <div className="py-2 align-middle inline-block min-w-full">
          <table className="w-full table-auto border-collapse">
            <ChainWeightTableHeader />
            <tbody>
              <>
                {tableData.map(({ chain, weight }) => (
                  <ChainWeightTableRow
                    key={chain}
                    chain={chain}
                    weight={weight}
                    tableData={tableData}
                    core={core}
                  />
                ))}
              </>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ChainWeightTableHeader: FC<{}> = () => {
  const { t } = useTranslation("common");
  return (
    <thead className="bg-background uppercase">
      <tr>
        <HeaderCell>
          <p className="text-left">{t("v2.dill.vote.rowChainName")}</p>
        </HeaderCell>

        <HeaderCell>
          <p className="text-center">{t("v2.dill.vote.rewardPct")}</p>
        </HeaderCell>
      </tr>
    </thead>
  );
};

const HeaderCell: FC<HTMLAttributes<HTMLElement>> = ({ children }) => (
  <th
    scope="col"
    className="px-4 py-1 h-8 text-xs font-bold text-foreground-alt-200 tracking-normal sm:px-6"
  >
    {children}
  </th>
);

export const ChainWeightTableRow: FC<{
  chain: string;
  weight: number;
  tableData: iChainWeights[];
  core: PickleModelJson.PickleModelJson | undefined;
}> = ({ chain, weight, tableData, core }) => {
  let classNameL = "";
  let classNameR = "";
  if (chain.toLowerCase() === tableData[0].chain.toLowerCase()) {
    classNameL = "rounded-tl-xl";
    classNameR = "rounded-tr-xl";
  }
  if (chain === tableData[tableData.length - 1].chain) {
    classNameL = "rounded-bl-xl";
    classNameR = "rounded-br-xl";
  }

  return (
    <>
      <tr className="group">
        <ChainTableCell className={classNameL}>
          <ChainTableP text={formatChainName(chain, core)} className="text-left" />
        </ChainTableCell>

        <ChainTableCell className={classNameR}>
          <ChainTableP text={formatPercentage(weight * 100, 3)} />
        </ChainTableCell>
      </tr>
    </>
  );
};

const ChainTableCell: FC<HTMLAttributes<HTMLElement>> = ({ children, className }) => (
  <td
    className={classNames(
      "bg-background-light p-4 whitespace-nowrap text-sm text-foreground text-center sm:p-6 group-hover:bg-background-lightest",
      className,
    )}
  >
    {children}
  </td>
);

const ChainTableP: FC<{ text: string; className?: string }> = ({ text, className }) => (
  <p className={classNames("font-title font-medium text-base leading-5", className)}>{text}</p>
);

const getPlatformChainWeights = (offchainVoteData: iOffchainVoteData | undefined) => {
  const platformWeights = offchainVoteData ? offchainVoteData.chains || [] : [];

  let chartData: iChainWeights[] = [];
  for (let c = 0; c < platformWeights.length; c++) {
    chartData.push({
      chain: platformWeights[c].chain,
      weight: platformWeights[c].adjustedChainWeight,
    });
  }

  chartData = sortByWeight(chartData);

  return chartData;
};

const formatChainName = (chain: string, core: PickleModelJson.PickleModelJson | undefined) => {
  const thisChain = core ? core.chains.find((c) => c.network === chain) : undefined;
  const displayName = thisChain ? thisChain.networkVisible : chain;
  return displayName;
};

const sortByWeight = (data: any[]) =>
  data ? data.sort((a, b) => (a.weight > b.weight ? -1 : 1)) : [];

interface iChainWeights {
  chain: string;
  weight: number;
}

export default ChainWeightTable;
