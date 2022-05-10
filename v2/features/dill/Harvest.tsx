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
import { formatDollars, formatPercentage } from "v2/utils";
import MoreInfo from "v2/components/MoreInfo";

interface Props {
  dill: IUserDillStats;
}

const Harvest: FC<Props> = ({ dill }) => {
  // WIP: fetch claimableEth, totalETHRewards and totalPickleRewards and remove hardcoded values
  const totalETHRewards = "816747.635322385";
  const totalPickleRewards = "816747.635322385";
  const { t } = useTranslation("common");
  const picklePrice = useSelector(CoreSelectors.selectPicklePrice);
  const ethPrice = useSelector(CoreSelectors.selectETHPrice);
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
          <MoreInfo>
            <p className="font-bold text-primary">{`${t("Total Rewards")}`}</p>
            {
              <>
                <div className="flex justify-between items-end">
                  <div className="font-bold text-foreground text-xs mr-2">ETH:</div>
                  <div className="font-bold text-foreground text-xs">
                    {parseFloat(totalETHRewards).toFixed(4)}
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-foreground text-xs mr-2">{""}</div>
                  <div className="text-foreground text-xs">
                    {formatDollars(parseFloat(totalETHRewards) * ethPrice)}
                  </div>
                </div>
              </>
            }
            {
              <>
                <div className="flex justify-between items-end">
                  <div className="font-bold text-foreground text-xs mr-2">PICKLE:</div>
                  <div className="font-bold text-foreground text-xs">
                    {parseFloat(totalPickleRewards).toFixed(4)}
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-foreground text-xs mr-2">{""}</div>
                  <div className="text-foreground text-xs">
                    {formatDollars(parseFloat(totalPickleRewards) * picklePrice)}
                  </div>
                </div>
              </>
            }
          </MoreInfo>
        </h1>
        <div className="flex justify-between items-top">
          <div>
            <br></br>
            <p className="text-primary whitespace-pre font-medium text-base">
              {/*WIP: change to claimableEth */}
              {`${parseFloat(formatEther(dill.claimable))} ETH`}
            </p>
            <h1 className="font-body text-foreground-alt-200 font-normal text-xs leading-4">
              {/*WIP: change to claimableEth*/}
              {`(${formatDollars(parseFloat(formatEther(dill.claimable)) * ethPrice)})`}
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
