import { PickleModelJson } from "picklefinance-core";
import { FC } from "react";
import { JarTableRow } from "./JarTableRow";
import JarTableHeader from "./JarTableHeader";
import { iOffchainVoteData } from "v2/store/offchainVotes";
import { UserDataV2 } from "v2/store/user";

export const JarTable: FC<{
  selectedJars: string[];
  core: PickleModelJson.PickleModelJson;
  mainnet: boolean;
  offchainVoteData?: iOffchainVoteData | undefined;
  wallet?: string | undefined | null;
  user?: UserDataV2;
}> = ({ selectedJars, core, mainnet, offchainVoteData, wallet, user }) => (
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
