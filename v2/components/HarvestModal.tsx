import { FC } from "react";
import Image from "next/image";
import { useTranslation } from "next-i18next";

import Button from "./Button";
import Modal from "./Modal";

interface Props {
  harvestables: RewardRowProps[];
  isOpen: boolean;
  closeModal: () => void;
}

export interface RewardRowProps {
  descriptor: string;
  rewardCount: number;
  tokenString: string;
  harvester: {
    harvest: () => Promise<boolean>;
  };
}
interface RewardRowPropWrapper {
  details: RewardRowProps;
}

const RewardRow: FC<RewardRowPropWrapper> = ({ details }) => {
  const { t } = useTranslation("common");

  // TODO image needs to be configurable for what the reward is
  return (
    <div className="flex justify-between font-body">
      <div className="flex">
        <div className="w-12 p-1 bg-background rounded-full mr-4 border-3 border-gray-outline">
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
            {details.rewardCount}
            <span className="text-foreground text-xs ml-2">
              {details.tokenString}
            </span>
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <Button type="secondary" size="small">
          {
            // TODO use the harvester when clicked on.
            t("v2.farms.harvest")
          }
        </Button>
      </div>
    </div>
  );
};

const HarvestModal: FC<Props> = ({ isOpen, closeModal, harvestables }) => {
  const { t } = useTranslation("common");
  const safeHarvestables = harvestables === undefined ? [] : harvestables;
  return (
    <Modal
      isOpen={isOpen}
      closeModal={closeModal}
      title={t("v2.farms.harvestRewards")}
    >
      <div className="grid gap-9">
        {safeHarvestables.map((h) => {
          const key = h.descriptor;
          return <RewardRow key={key} details={h} />;
        })}
      </div>
    </Modal>
  );
};

export default HarvestModal;
