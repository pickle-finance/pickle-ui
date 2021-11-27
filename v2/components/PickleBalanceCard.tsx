import { FC } from "react";
import Image from "next/image";
import { useTranslation } from "next-i18next";

const PickleBalanceCard: FC = () => {
  const { t } = useTranslation("common");

  return (
    <div className="bg-gradient rounded-2xl border border-gray-dark shadow mb-4">
      <div className="relative p-6 sm:p-8">
        <div className="flex mr-20">
          <div className="w-12 h-12 p-1 bg-black rounded-full mr-5">
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
              42.789
            </p>
            <p className="text-gray-light text-sm">
              {t("v2.dashboard.picklesInWallet")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickleBalanceCard;
