import { FC } from "react";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { BigNumber } from "@ethersproject/bignumber";

import { UserSelectors } from "v2/store/user";
import { useAppSelector } from "v2/store";
import { useAccount } from "v2/hooks";

const DillBalanceCard: FC = () => {
  const { t } = useTranslation("common");
  const account = useAccount();
  const userModel = useAppSelector((state) => UserSelectors.selectData(state, account));
  let dill = "0.00";
  let lockedPickles = "0.00";

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

  if (userModel && userModel.dill && userModel.dill.balance) {
    // TODO this specific logic of dividing by 1e18 but then getting 3 decimals seems common.
    // Might want to extract to a utility
    dill = (BigNumber.from(userModel.dill.balance).div(1e10).div(1e5).toNumber() / 1e3).toString();
    if (userModel.dill.pickleLocked)
      lockedPickles = (
        BigNumber.from(userModel.dill.pickleLocked).div(1e10).div(1e5).toNumber() / 1e3
      ).toString();
  }

  return (
    <div className="bg-gradient rounded-2xl border border-foreground-alt-500 shadow">
      <div className="relative p-6 sm:p-8">
        <div className="flex mr-20">
          <div className="w-12 h-12 p-1 bg-background rounded-full mr-5">
            <Image
              src="/pickle-icon.svg"
              width={48}
              height={48}
              layout="intrinsic"
              alt="Pickle Finance"
              title="Pickle Finance"
            />
          </div>
          <div>
            <p className="font-title font-medium text-2xl leading-7 mb-1">{pickles}</p>
            <p className="text-foreground-alt-200 text-sm">
              {chains > 1
                ? t("v2.dashboard.picklesInWallet", { chains: chains })
                : t("v2.dashboard.picklesInWalletZeroOrOne")}
            </p>
          </div>
        </div>
        <div className="flex mr-20 mt-5">
          <div className="w-12 h-12 p-2 bg-background rounded-full mr-5">
            <Image
              src="/dill-icon.png"
              width={48}
              height={48}
              layout="intrinsic"
              alt="Pickle Finance"
              title="Pickle Finance"
            />
          </div>
          <div>
            <p className="font-title font-medium text-2xl leading-7 mb-1">{dill}</p>
            <p className="text-foreground-alt-200 text-sm">{t("v2.dashboard.dillAmount")}</p>
          </div>
        </div>
        <div className="flex mr-20 mt-5">
          <div className="w-12 h-12 p-2 bg-background rounded-full mr-5">
            <Image
              src="/pickle-icon.svg"
              width={48}
              height={48}
              layout="intrinsic"
              alt="Pickle Finance"
              title="Pickle Finance"
            />
          </div>
          <div>
            <p className="font-title font-medium text-2xl leading-7 mb-1">{lockedPickles}</p>
            <p className="text-foreground-alt-200 text-sm">{t("v2.dashboard.lockedPickles")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DillBalanceCard;
