import { FC } from "react";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { BigNumber, ethers } from "ethers";
import { ChainNetwork } from "picklefinance-core";
import { formatEther } from "ethers/lib/utils";

import Modal from "./Modal";
import { roundToSignificantDigits } from "v2/utils";
import HarvestFlow, { Rewarder } from "v2/features/farms/flows/harvest/HarvestFlow";
import { Asset } from "v2/store/core.helpers";

interface Props {
  harvestables: RewardRowProps[];
  isOpen: boolean;
  closeModal: () => void;
}

export interface RewardRowProps {
  asset: Asset | undefined;
  descriptor: string;
  harvestableAmount: BigNumber;
  claimableV1: BigNumber;
  claimableEthV2: BigNumber;
  claimableTokenV2: BigNumber;
  rewarderType: Rewarder;
  network: ChainNetwork;
}
interface RewardRowPropWrapper {
  details: RewardRowProps;
}

/**
 * Any reward amount lower than this will show up as 0 when
 * formatted so skip those rows altogether to avoid confusion.
 */
const threshold = BigNumber.from("1000000000000");

const RewardRow: FC<RewardRowPropWrapper> = ({ details }) => {
  const totalEthRewards = parseFloat(ethers.utils.formatEther(details.claimableEthV2));
  const totalPickleRewards = parseFloat(
    ethers.utils.formatEther(
      details.claimableTokenV2.add(details.claimableV1).add(details.harvestableAmount),
    ),
  );

  const totalRewards = details.claimableEthV2
    .add(details.claimableTokenV2)
    .add(details.claimableV1)
    .add(details.harvestableAmount);

  if (totalRewards.lt(threshold)) return null;

  return (
    <div className="flex justify-between font-body">
      <div className="flex">
        <div className="w-12 p-1 h-fit bg-background rounded-full mr-4 border-3 border-foreground-alt-400">
          <Image
            src="/pickle-icon.svg"
            width={200}
            height={200}
            layout="responsive"
            alt="Pickle Finance"
            title="Pickle Finance"
          />
        </div>
        <div className="flex flex-col text-left justify-center">
          <p className="uppercase text-foreground-alt-200 font-bold text-xs">
            {details.descriptor}
          </p>
          <p className="text-primary font-bold text-lg align-bottom leading-6">
            {roundToSignificantDigits(totalPickleRewards, 5)}
            <span className="text-foreground text-xs ml-2">PICKLE</span>
          </p>
          {details.rewarderType == "dill" && (
            <p className="text-primary font-bold text-lg align-bottom leading-6">
              {roundToSignificantDigits(totalEthRewards, 5)}
              <span className="text-foreground text-xs ml-2">ETH</span>
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center">
        <HarvestFlow
          rewarderType={details.rewarderType}
          asset={details.asset}
          buttonSize="small"
          buttonType="secondary"
          harvestableAmount={details.harvestableAmount}
          claimableV1={details.claimableV1}
          claimableV2={details.claimableTokenV2}
          claimableETHV2={details.claimableEthV2}
          network={details.network}
          showNetworkSwitch
        />
      </div>
    </div>
  );
};

const HarvestModal: FC<Props> = ({ isOpen, closeModal, harvestables }) => {
  const { t } = useTranslation("common");
  const safeHarvestables = harvestables === undefined ? [] : harvestables;

  // Close modal once user harvests their last reward.
  if (safeHarvestables.length === 0) closeModal();

  return (
    <Modal size="wide" isOpen={isOpen} closeModal={closeModal} title={t("v2.farms.harvestRewards")}>
      <div className="grid gap-9">
        {safeHarvestables.map((harvestable) => (
          <RewardRow key={harvestable.descriptor} details={harvestable} />
        ))}
      </div>
    </Modal>
  );
};

export default HarvestModal;
