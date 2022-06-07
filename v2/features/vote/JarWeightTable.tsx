import { useTranslation } from "next-i18next";
import { PickleModelJson } from "picklefinance-core";
import { PickleAsset } from "picklefinance-core/lib/model/PickleModelJson";
import { FC, HTMLAttributes } from "react";
import { iOffchainVoteData, JarVote } from "v2/store/offchainVotes";
import { classNames, formatPercentage } from "v2/utils";

const JarWeightTable: FC<{
  core: PickleModelJson.PickleModelJson | undefined;
  offchainVoteData: iOffchainVoteData | undefined;
  chain: string;
}> = ({ core, offchainVoteData, chain }) => {
  const tableData =
    chain === "eth"
      ? core && getMainnetPlatformWeights(core)
      : offchainVoteData && getSidechainPlatformWeights(offchainVoteData, chain);
  return (
    <div className="flex flex-col mb-10 w-full max-h-[400px]">
      <div className="-my-2 overflow-x-auto">
        <div className="py-2 align-middle inline-block min-w-full">
          <table className="min-w-full table-auto border-collapse">
            <JarWeightTableHeader />
            <tbody>
              <>
                {tableData &&
                  tableData.map(({ jar, weight }) => (
                    <JarWeightTableRow key={jar} jar={jar} weight={weight} tableData={tableData} />
                  ))}
              </>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const JarWeightTableHeader: FC<{}> = () => {
  const { t } = useTranslation("common");
  return (
    <thead className="bg-background uppercase">
      <tr>
        <HeaderCell>
          <p className="text-left">{t("v2.dill.vote.rowAssetName")}</p>
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

export const JarWeightTableRow: FC<{
  jar: string;
  weight: number;
  tableData: iJarWeights[];
}> = ({ jar, weight, tableData }) => {
  let classNameL = "";
  let classNameR = "";
  if (jar.toLowerCase() === tableData[0].jar.toLowerCase()) {
    classNameL = "rounded-tl-xl";
    classNameR = "rounded-tr-xl";
  }
  if (jar === tableData[tableData.length - 1].jar) {
    classNameL = "rounded-bl-xl";
    classNameR = "rounded-br-xl";
  }
  return (
    <>
      <tr className="group">
        <JarTableCell className={classNameL}>
          <JarTableP text={jar} className="text-left" />
        </JarTableCell>

        <JarTableCell className={classNameR}>
          <JarTableP text={formatPercentage(weight * 100, 3)} />
        </JarTableCell>
      </tr>
    </>
  );
};

const JarTableCell: FC<HTMLAttributes<HTMLElement>> = ({ children, className }) => (
  <td
    className={classNames(
      "bg-background-light p-4 whitespace-nowrap text-sm text-foreground text-center sm:p-6 group-hover:bg-background-lightest",
      className,
    )}
  >
    {children}
  </td>
);

const JarTableP: FC<{ text: string; className?: string }> = ({ text, className }) => (
  <p className={classNames("font-title font-medium text-base leading-5", className)}>{text}</p>
);

const stringForAsset = (asset: PickleAsset): string => {
  return asset.details?.apiKey ? asset.details.apiKey + " (" + asset.id + ")" : asset.id;
};

const getMainnetPlatformWeights = (
  core: PickleModelJson.PickleModelJson | undefined,
): iJarWeights[] => {
  const mainnetJars: PickleModelJson.JarDefinition[] = core
    ? core.assets.jars.filter((j) => j.chain === "eth")
    : [];
  let chartData = [];
  for (let i = 0; i < mainnetJars.length; i++) {
    if (mainnetJars[i].farm?.details?.allocShare !== undefined) {
      chartData.push({
        jar: stringForAsset(mainnetJars[i]),
        weight: mainnetJars[i].farm?.details?.allocShare || 0,
      });
    }
  }
  chartData = sortByWeight(chartData);

  return chartData;
};

const getSidechainPlatformWeights = (
  offchainVoteData: iOffchainVoteData | undefined,
  chain: string,
): iJarWeights[] => {
  const platformWeights = offchainVoteData ? offchainVoteData.chains || [] : [];
  let chartData = [];
  for (let c = 0; c < platformWeights.length; c++) {
    if (platformWeights[c].chain === chain) {
      let jarVotes: JarVote[] = platformWeights[c].jarVotes;
      for (let j = 0; j < jarVotes.length; j++) {
        chartData.push({
          jar: jarVotes[j].key,
          weight: jarVotes[j].jarVoteAsChainEmissionShare || 0,
        });
      }
    }
  }
  chartData = sortByWeight(chartData);
  return chartData;
};

const sortByWeight = (data: any[]) =>
  data ? data.sort((a, b) => (a.weight > b.weight ? -1 : 1)) : [];

interface iJarWeights {
  jar: string;
  weight: number;
}

export default JarWeightTable;
