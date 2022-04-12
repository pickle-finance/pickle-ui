import { FC } from "react";
import { PickleModelJson } from "picklefinance-core";
import { UserData } from "picklefinance-core/lib/client/UserModel";
import { iOffchainVoteData } from "v2/store/offchainVotes";

import JarTableHeader from "./JarTableHeader";
import JarTableRow from "./JarTableRow";

const JarTable: FC<{
  selectedJars: string[];
  core: PickleModelJson.PickleModelJson;
  mainnet: boolean;
  setChange: (e: any) => void;
  offchainVoteData?: iOffchainVoteData | undefined;
  wallet?: string | undefined | null;
  user?: UserData;
}> = ({ selectedJars, core, mainnet, setChange, offchainVoteData, wallet, user }) => (
  <div className="flex flex-col mt-10">
    <div className="-my-2 overflow-x-auto">
      <div className="py-2 align-middle inline-block min-w-full">
        <table className="min-w-full table-auto border-collapse">
          <JarTableHeader />
          <tbody>
            <>
              {selectedJars.map((apiKey: string) => (
                <JarTableRow
                  key={apiKey}
                  jar={apiKey}
                  core={core}
                  mainnet={mainnet}
                  setChange={setChange}
                  offchainVoteData={offchainVoteData}
                  wallet={wallet}
                  user={user}
                />
              ))}
            </>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default JarTable;
