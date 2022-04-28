import { useTranslation } from "next-i18next";
import { FC, HTMLAttributes } from "react";
import { iOffchainVoteData } from "v2/store/offchainVotes";
import { classNames, formatPercentage } from "v2/utils";

const ChainWeightTable: FC<{ offchainVoteData: iOffchainVoteData | undefined }> = ({
  offchainVoteData,
}) => {
  const tableData = getPlatformChainWeights(offchainVoteData);
  return (
    <div className="flex flex-col mt-20 mb-10 max-h-full">
      <div className="-my-2 overflow-x-auto">
        <div className="py-2 align-middle inline-block min-w-full">
          <table className="min-w-full table-auto border-collapse">
            <ChainWeightTableHeader />
            <tbody>
              <>
                {tableData.map(({ chain, weight }) => (
                  <ChainWeightTableRow
                    key={chain}
                    chain={chain}
                    weight={weight}
                    tableData={tableData}
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
}> = ({ chain, weight, tableData }) => {
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
          <ChainTableP text={chain} className="text-left" />
        </ChainTableCell>

        <ChainTableCell className={classNameR}>
          <ChainTableP text={formatPercentage(weight, 3)} />
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

const sortByWeight = (data: any[]) =>
  data ? data.sort((a, b) => (a.weight > b.weight ? -1 : 1)) : [];

interface iChainWeights {
  chain: string;
  weight: number;
}

export default ChainWeightTable;
