import React, { FC } from "react";
import { useTranslation } from "next-i18next";
import { IUserDillStats } from "picklefinance-core/lib/client/UserModel";
import { formatEther } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { ChainNetwork } from "picklefinance-core";

import DillCard from "./DillCard";
import HarvestFlow from "../farms/flows/harvest/HarvestFlow";

interface Props {
  dill: IUserDillStats;
}

const Harvest: FC<Props> = ({ dill }) => {
  const { t } = useTranslation("common");

  return (
    <DillCard
      title={t("v2.dill.earnedPickles")}
      data={parseFloat(formatEther(dill.claimable)).toFixed(3)}
    >
      <HarvestFlow
        rewarderType="dill"
        harvestableAmount={BigNumber.from(dill.claimable)}
        network={ChainNetwork.Ethereum}
      />
    </DillCard>
  );
};

export default Harvest;
