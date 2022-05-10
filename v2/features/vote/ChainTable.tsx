import { FC } from "react";
import ChainTableHeader from "./ChainTableHeaders";
import { ChainTableRow } from "./ChainTableRow";
import { PickleModelJson } from "picklefinance-core";
import { iOffchainVoteData } from "v2/store/offchainVotes";

const ChainTable: FC<{
  selectedChains: string[];
  core: PickleModelJson.PickleModelJson | undefined;
  offchainVoteData: iOffchainVoteData | undefined;
  wallet: string | undefined | null;
  setChange: (e: any) => void;
}> = ({ selectedChains, core, offchainVoteData, wallet, setChange }) => (
  <div className="flex flex-col mt-10 mb-10">
    <div className="-my-2 overflow-x-auto">
      <div className="py-2 align-middle inline-block min-w-full">
        <table className="min-w-full table-auto border-collapse">
          <ChainTableHeader />
          <tbody>
            <>
              {selectedChains.map((network: string) => (
                <ChainTableRow
                  key={network}
                  network={network}
                  core={core}
                  offchainVoteData={offchainVoteData}
                  wallet={wallet}
                  setChange={setChange}
                />
              ))}
            </>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default ChainTable;
