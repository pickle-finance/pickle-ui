import { FC } from "react";
import Image from "next/image";
import { useTranslation } from "next-i18next";

import Button from "./Button";
import Modal from "./Modal";

interface Props {
  isOpen: boolean;
  closeModal: () => void;
}

const RewardRow: FC = () => {
  const { t } = useTranslation("common");

  return (
    <div className="flex justify-between font-body">
      <div className="flex">
        <div className="w-12 p-1 bg-black rounded-full mr-4 border-3 border-gray-outline">
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
          <p className="uppercase text-gray-light font-bold text-xs">
            PICKLE-ETH
          </p>
          <p className="text-green font-bold text-lg align-bottom leading-6">
            102.01
            <span className="text-white text-xs ml-2">PICKLEs</span>
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <Button type="secondary" size="small">
          {t("v2.farms.harvest")}
        </Button>
      </div>
    </div>
  );
};

const HarvestModal: FC<Props> = ({ isOpen, closeModal }) => {
  const { t } = useTranslation("common");

  return (
    <Modal
      isOpen={isOpen}
      closeModal={closeModal}
      title={t("v2.farms.harvestRewards")}
    >
      <div className="grid gap-9">
        <RewardRow />
        <RewardRow />
      </div>
    </Modal>
  );
};

export default HarvestModal;
