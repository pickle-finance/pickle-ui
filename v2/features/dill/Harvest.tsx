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
  if (!dill.claimableETHV2 ) return <></>;
  console.log(dill)
  const totalETHRewards = Number(dill.claimableETHV2);
  const pickleRewardsV2 = Number(dill.claimableV2);
  const claimable = Number(dill.claimable);

  const { t } = useTranslation("common");

  const picklePrice = useSelector(CoreSelectors.selectPicklePrice);
  const ethPrice = useSelector(CoreSelectors.selectETHPrice);
  const totalEthRewards = parseFloat(formatEther(totalETHRewards));
  const totalPickleRewards = parseFloat(formatEther(pickleRewardsV2 + claimable));

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
            {`${totalEthRewards.toFixed(4)} ETH`}
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
          claimableV1={claimable}
          claimableV2={pickleRewardsV2} 
          claimableETHV2={totalEthRewards}
          network={ChainNetwork.Ethereum}
        />
      </div>
    </aside>
  );
};

export default Harvest;
