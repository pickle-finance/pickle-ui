import { FC } from "react";
import { iOffchainVoteData } from "v2/store/offchainVotes";
import StratTableHeader from "./StratTableHeader";
import StratTableRow, { iStrategyTranslation } from "./StratTableRow";

const StratTable: FC<{
  selectedStrats: string[];
  offchainVoteData: iOffchainVoteData | undefined;
  wallet: string | undefined | null;
}> = ({ selectedStrats, offchainVoteData, wallet }) => (
  <div className="flex flex-col mt-10">
    <div className="-my-2 overflow-x-auto">
      <div className="py-2 align-middle inline-block min-w-full">
        <table className="min-w-full table-auto border-collapse">
          <StratTableHeader />
          <tbody>
            <>
              {selectedStrats.map((strat: string) => (
                <StratTableRow
                  key=""
                  strat={strat as keyof iStrategyTranslation}
                  offchainVoteData={offchainVoteData}
                  wallet={wallet}
                />
              ))}
            </>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default StratTable;
