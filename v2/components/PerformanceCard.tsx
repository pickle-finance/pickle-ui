import { FC, useState } from "react";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { UserData } from "picklefinance-core/lib/client/UserModel";

import Button from "./Button";
import HarvestModal from "./HarvestModal";
import { useSelector } from "react-redux";
import { UserSelectors } from "v2/store/user";

const PerformanceCard: FC = () => {
  const { t } = useTranslation("common");
  let [isOpen, setIsOpen] = useState<boolean>(false);
  const userModel: UserData | undefined = useSelector(UserSelectors.selectData);

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
            <div className="bg-black p-2 w-12 h-12 rounded-full mr-6">
              <Image
                src="/pickle-icon.svg"
                width={200}
                height={200}
                layout="responsive"
                alt="Pickle Finance"
                title="Pickle Finance"
              />
            </div>
            <div>
              <p className="font-title font-medium text-2xl leading-7 mb-1">
                {/* {userModel?.earnings || 0} */}
                {420}
              </p>
              <p className="text-gray-light text-sm">
                {t("v2.balances.balance")}
              </p>
            </div>
          </div>
          <div className="flex">
            <div className="bg-black p-2 w-12 h-12 rounded-full mr-6">
              <Image
                src="/pickle-icon.svg"
                width={200}
                height={200}
                layout="responsive"
                alt="Pickle Finance"
                title="Pickle Finance"
              />
            </div>
            <div>
              <p className="font-title font-medium text-2xl leading-7 mb-1">
                {69}
                {/* {userModel?.pickles} */}
              </p>
              <p className="text-gray-light text-sm">
                {t("v2.dashboard.unclaimedRewards")}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="relative px-6 py-4 sm:px-8 sm:py-6">
        <Button onClick={openModal} size="normal">
          {t("v2.dashboard.harvestRewards")}
        </Button>
        <HarvestModal isOpen={isOpen} closeModal={closeModal} />
      </div>
    </div>
  );
};

export default PerformanceCard;
