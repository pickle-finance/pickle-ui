import React, { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import { IUserDillStats } from "picklefinance-core/lib/client/UserModel";
import { formatEther } from "ethers/lib/utils";

import Button from "v2/components/Button";
import DillCard from "./DillCard";
import { useDistributorContract } from "./flows/hooks";
import { FEE_DISTRIBUTOR } from "./GetDillModal";
import Spinner from "v2/components/Spinner";

interface Props {
  dill: IUserDillStats;
}

const Harvest: FC<Props> = ({ dill }) => {
  const { t } = useTranslation("common");

  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [isSuccess, setSuccess] = useState<boolean>(false);
  const DistributionContract = useDistributorContract(FEE_DISTRIBUTOR);

  if (!DistributionContract) return null;

  const sendTransaction = async () => {
    setIsWaiting(true);
    try {
      const transaction = await DistributionContract["claim()"]();
      await transaction.wait();
      setIsWaiting(false);
      setSuccess(true)
    } catch (e) {
      setIsWaiting(false);
      setSuccess(false)
    }
  };

  return (
    <DillCard
      title={t("v2.dill.earnedPickles")}
      data={parseFloat(formatEther(dill.claimable)).toFixed(3)}
    >
      <Button
        onClick={sendTransaction}
        state={parseFloat(dill?.pickleLocked) && !isWaiting && !isSuccess ? "enabled" : "disabled"}
      >
        {isWaiting && (
          <div className="w-3 h-3 mr-3">
            <Spinner />
          </div>
        )}
        {isSuccess ? t("v2.farms.success") : t("v2.actions.harvest")}
      </Button>
    </DillCard>
  );
};

export default Harvest;
