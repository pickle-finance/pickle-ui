import { FC } from "react";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { UserData } from "picklefinance-core/lib/client/UserModel";
import { useSelector } from "react-redux";
import { UserSelectors } from "v2/store/user";
import { BigNumber } from "@ethersproject/bignumber";

const DillBalanceCard: FC = () => {
  const { t } = useTranslation("common");
  const userModel: UserData | undefined = useSelector(UserSelectors.selectData);
  let val = "0.00";
  // TODO this specific logic of dividing by 1e18 but then getting 3 decimals seems common.
  // Might want to extract to a utility
  if (userModel && userModel.dill && userModel.dill.balance) {
    val = (
      BigNumber.from(userModel.dill.balance).div(1e10).div(1e5).toNumber() / 1e3
    ).toString();
  }

  return (
    <div className="bg-gradient rounded-2xl border border-gray-dark shadow">
      <div className="relative p-6 sm:p-8">
        <div className="flex mr-20">
          <div className="w-12 h-12 p-2 bg-black rounded-full mr-5">
            <Image
              src="/dill-icon.png"
              width={200}
              height={200}
              layout="responsive"
              alt="Pickle Finance"
              title="Pickle Finance"
            />
          </div>
          <div>
            <p className="font-title font-medium text-2xl leading-7 mb-1">
              {val}
            </p>
            <p className="text-gray-light text-sm">
              {t("v2.dashboard.dillAmount")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DillBalanceCard;
