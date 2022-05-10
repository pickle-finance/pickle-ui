import React, { FC } from "react";
import { useTranslation } from "next-i18next";
import { useSelector } from "react-redux";
import { IUserDillStats } from "picklefinance-core/lib/client/UserModel";
import { formatEther } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { ChainNetwork } from "picklefinance-core";
import { CoreSelectors } from "v2/store/core";
import DillCard from "./DillCard";
import HarvestFlow from "../farms/flows/harvest/HarvestFlow";
import { formatDollars } from "v2/utils";

interface Props {
  dill: IUserDillStats;
}

const Harvest: FC<Props> = ({ dill }) => {
  const { t } = useTranslation("common");
  const picklePrice = useSelector(CoreSelectors.selectPicklePrice);
  return (
    <>
      {/* <DillCard
        // title={t("v2.dill.earnedRewards")}
        title={t("Earned Rewards")}
        data={parseFloat(formatEther(dill.claimable)).toFixed(3)}
      >
        <HarvestFlow
          rewarderType="dill"
          harvestableAmount={BigNumber.from(dill.claimable)}
          network={ChainNetwork.Ethereum}
        />
      </DillCard> */}
      <aside className="border border-foreground-alt-500 grow font-title rounded-lg tracking-normal p-4">
        <h1 className="font-medium text-foreground-alt-200 text-base leading-5">
          {t("Earned Rewards")}
        </h1>
        <div className="flex justify-between items-top">
          <div>
            <br></br>
            <p className="text-primary whitespace-pre font-medium text-base">
              {/*WIP: change to claimableEth */}
              {`${parseFloat(formatEther(dill.claimable))} ETH`}
            </p>
            <h1 className="font-body text-foreground-alt-200 font-normal text-xs leading-4">
              {/*WIP: change to claimableEth FETCH ETH PRICE AND MULTIPLY BELOW */}
              {`(${formatDollars(parseFloat(formatEther(dill.claimable)))})`}
            </h1>
            <p className="text-primary whitespace-pre font-medium text-base">
              {`${parseFloat(formatEther(dill.claimable))} PICKLE`}
            </p>
            <h1 className="font-body text-foreground-alt-200 font-normal text-xs leading-4">
              {`(${formatDollars(parseFloat(formatEther(dill.claimable)) * picklePrice)})`}
            </h1>
            <br></br>
          </div>
          <HarvestFlow
            rewarderType="dill"
            harvestableAmount={BigNumber.from(dill.claimable)}
            network={ChainNetwork.Ethereum}
          />
        </div>
      </aside>
    </>
  );
};

export default Harvest;
