import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import { CashIcon, DatabaseIcon } from "@heroicons/react/solid";

import Button from "./Button";
import HarvestModal from "./HarvestModal";

const PerformanceCard: FC = () => {
  const { t } = useTranslation("common");
  let [isOpen, setIsOpen] = useState<boolean>(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <div className="bg-gradient rounded-2xl border border-gray-dark shadow">
      <div className="relative px-6 pt-4 sm:px-8 sm:pt-6 border-b border-gray-dark">
        <h2 className="text-lg font-normal text-gray-light mb-7">
          {t("v2.dashboard.performance")}
        </h2>
        <div className="flex flex-wrap mb-9">
          <div className="flex mr-20 mb-6 xl:mb-0">
            <div className="bg-green p-2 w-12 h-12 rounded-full mr-6">
              <CashIcon />
            </div>
            <div>
              <p className="font-title font-medium text-2xl leading-7 mb-1">
                $9,888.99
              </p>
              <p className="text-gray-light text-sm">
                {t("v2.dashboard.balance")}
              </p>
            </div>
          </div>
          <div className="flex">
            <div className="bg-black p-2 w-12 h-12 rounded-full mr-6">
              <DatabaseIcon />
            </div>
            <div>
              <p className="font-title font-medium text-2xl leading-7 mb-1">
                $777.89
              </p>
              <p className="text-gray-light text-sm">
                {t("v2.dashboard.unclaimedRewards")}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="relative px-6 py-4 sm:px-8 sm:py-6">
        <Button handleClick={openModal} size="normal">
          {t("v2.dashboard.harvestRewards")}
        </Button>
        <HarvestModal isOpen={isOpen} closeModal={closeModal} />
      </div>
    </div>
  );
};

export default PerformanceCard;
