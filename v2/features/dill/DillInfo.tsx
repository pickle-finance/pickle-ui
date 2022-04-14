import React, { FC } from "react";
import { useSelector } from "react-redux";
import { ChainNetwork } from "picklefinance-core";

import { UserSelectors } from "v2/store/user";
import LoadingIndicator from "v2/components/LoadingIndicator";
import DillAmount from "./DillAmount";
import UnlockDate from "./UnlockDate";
import Harvest from "./Harvest";
import { useNeedsNetworkSwitch } from "v2/hooks";
import ConnectButton from "../farms/ConnectButton";

const DillInfo: FC = () => {
  const userData = useSelector(UserSelectors.selectData);
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
      <DillAmount pickles={pickles} dill={dill} />
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
