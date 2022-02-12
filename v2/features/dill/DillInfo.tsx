import React, { FC } from "react";
import { useSelector } from "react-redux";
import { ethers } from "ethers";

import { UserSelectors } from "v2/store/user";
import LoadingIndicator from "v2/components/LoadingIndicator";
import DillAmount from "./DillAmount";
import UnlockDate from "./UnlockDate";
import Harvest from "./Harvest";

const DillInfo: FC = () => {
  const userData = useSelector(UserSelectors.selectData);

  if (!userData) return <LoadingIndicator waitForUserModel />;

  const userBalance = ethers.utils.formatUnits(userData.dill.balance);

  return (
    <>
      <DillAmount dillBalance={parseFloat(userBalance)} />
      <UnlockDate />
      <Harvest />
    </>
  );
};

export default DillInfo;
