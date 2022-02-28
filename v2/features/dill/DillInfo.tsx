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

  if (!userData)
    return (
      <div className="col-span-3">
        <LoadingIndicator waitForUserModel />
      </div>
    );

  const userBalance = ethers.utils.formatUnits(userData.dill.balance);

  return (
    <>
      <DillAmount
        pickleBalance={19} // TODO: fetch real value
        dillBalance={parseFloat(userBalance)}
      />
      <UnlockDate />
      <Harvest />
    </>
  );
};

export default DillInfo;
