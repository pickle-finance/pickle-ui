import React, { FC } from "react";
import { useTranslation } from "next-i18next";
import { useSelector } from "react-redux";
import { IUserDillStats } from "picklefinance-core/lib/client/UserModel";
import { formatEther } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { ChainNetwork } from "picklefinance-core";

import { CoreSelectors } from "v2/store/core";
import HarvestFlow from "../farms/flows/harvest/HarvestFlow";
import { formatDollars } from "v2/utils";
import MoreInfo from "v2/components/MoreInfo";

interface Props {
  dill: IUserDillStats;
}

const Harvest: FC<Props> = ({ dill }) => {
  const claimableETHRewards = BigNumber.from(dill.claimableETHV2);
  const claimablePickleRewardsV2 = BigNumber.from(dill.claimableV2);
  const pickleRewardsV1 = BigNumber.from(dill.claimable);
  const totalETHRewards = BigNumber.from(dill.totalClaimableETHV2);
  const totalPickleRewardsV2 = BigNumber.from(dill.totalClaimableTokenV2);

  const { t } = useTranslation("common");

  const picklePrice = useSelector(CoreSelectors.selectPicklePrice);
  const ethPrice = useSelector(CoreSelectors.selectETHPrice);
  const totalEthRewards = parseFloat(formatEther(totalETHRewards));
  const totalPickleRewards = parseFloat(formatEther(totalPickleRewardsV2.add(pickleRewardsV1)));

  return (
    <aside className="border border-foreground-alt-500 grow font-title rounded-lg tracking-normal p-4">
      <h1 className="font-medium text-foreground-alt-200 text-base leading-5">
        {t("v2.dill.earnedRewards")}
        <MoreInfo>
          {
            <div className="flex justify-between items-end">
              <div className="text-foreground text-xs">{t("v2.dill.earnedRewardToolTip")}</div>
            </div>
          }
        </MoreInfo>
      </h1>
      <div className="flex justify-between items-top">
        <div>
          <br></br>
          <p className="text-primary whitespace-pre font-medium text-base">
            {`${totalEthRewards.toFixed(8)} ETH`}
          </p>
          <h1 className="font-body text-foreground-alt-200 font-normal text-xs leading-4">
            {`(${formatDollars(totalEthRewards * ethPrice)})`}
          </h1>
          <p className="text-primary whitespace-pre font-medium text-base">
            {`${totalPickleRewards.toFixed(4)} PICKLE`}
          </p>
          <h1 className="font-body text-foreground-alt-200 font-normal text-xs leading-4">
            {`(${formatDollars(totalPickleRewards * picklePrice)})`}
          </h1>
          <br></br>
        </div>
        <HarvestFlow
          rewarderType="dill"
          claimableV1={pickleRewardsV1}
          claimableV2={claimablePickleRewardsV2}
          claimableETHV2={claimableETHRewards}
          network={ChainNetwork.Ethereum}
        />
      </div>
    </aside>
  );
};

export default Harvest;
