import React, { FC } from "react";
import { ChainNetwork } from "picklefinance-core";

import { UserSelectors } from "v2/store/user";
import LoadingIndicator from "v2/components/LoadingIndicator";
import DillAmount from "./DillAmount";
import UnlockDate from "./UnlockDate";
import Harvest from "./Harvest";
import { useAccount, useNeedsNetworkSwitch } from "v2/hooks";
import ConnectButton from "../farms/ConnectButton";
import { useAppSelector } from "v2/store";

const DillInfo: FC = () => {
  const account = useAccount();
  const userData = useAppSelector((state) => UserSelectors.selectData(state, account));
  const { network, needsNetworkSwitch } = useNeedsNetworkSwitch(ChainNetwork.Ethereum);

  if (!userData)
    return (
      <div className="col-span-3">
        <LoadingIndicator waitForUserModel className="py-8" />
      </div>
    );

  const { pickles, dill } = userData;

  return (
    <>
      <DillAmount pickles={pickles} userDill={dill} />
      <UnlockDate dill={dill} />
      <Harvest dill={dill} />
      {needsNetworkSwitch && (
        <div className="absolute inset-0 flex grow justify-center items-center border border-foreground-alt-500 rounded-lg bg-background-light bg-opacity-90 backdrop-filter backdrop-blur-sm">
          <ConnectButton network={network} />
        </div>
      )}
    </>
  );
};

export default DillInfo;
