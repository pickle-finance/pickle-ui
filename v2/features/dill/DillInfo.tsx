import React, { FC } from "react";
import { useSelector } from "react-redux";
import { ethers } from "ethers";

import { UserSelectors } from "v2/store/user";
import LoadingIndicator from "v2/components/LoadingIndicator";
import DillAmount from "./DillAmount";
import UnlockDate from "./UnlockDate";
import Harvest from "./Harvest";
import { useAppSelector } from "v2/store";

const DillInfo: FC = () => {
  const userData = useSelector(UserSelectors.selectData);

  if (!userData)
    return (
      <div className="col-span-3">
        <LoadingIndicator waitForUserModel className="py-8" />
      </div>
    );

  const userBalance = parseFloat(ethers.utils.formatUnits(userData.dill.balance));
  const { pickles, dill } = userData;

  return (
    <>
      <DillAmount pickles={pickles} dill={dill} />
      <UnlockDate dill={dill} />
      <Harvest dill={dill}/>
    </>
  );
};

export default DillInfo;
