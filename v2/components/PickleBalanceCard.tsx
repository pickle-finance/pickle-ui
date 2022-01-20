import { FC } from "react";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { useSelector } from "react-redux";
import { UserSelectors } from "v2/store/user";
import { UserData } from "picklefinance-core/lib/client/UserModel";
import { BigNumber } from "@ethersproject/bignumber";

const PickleBalanceCard: FC = () => {
  const { t } = useTranslation("common");
  const userModel: UserData | undefined = useSelector(UserSelectors.selectData);
  let pickles = 0;
  let chains = 0;
  if (userModel) {
    for (const k in userModel.pickles) {
      const v = userModel.pickles[k];
      if (v !== undefined && v !== "0") {
        pickles += BigNumber.from(v).div(1e10).toNumber() / 1e8;
        chains++;
      }
    }
    pickles = Math.floor(pickles * 1000) / 1000;
  }

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
              {pickles}
            </p>
            <p className="text-gray-light text-sm">
              {chains > 1
                ? t("v2.dashboard.picklesInWallet", { chains: chains })
                : t("v2.dashboard.picklesInWalletZeroOrOne")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickleBalanceCard;
