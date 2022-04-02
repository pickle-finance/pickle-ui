import { FC } from "react";
import { useTranslation } from "next-i18next";

import { useAppSelector } from "v2/store";
import Button from "v2/components/Button";
import { CoreSelectors, JarWithData } from "v2/store/core";
import { UserSelectors } from "v2/store/user";
import { getUserAssetDataWithPrices } from "v2/utils/user";
import ApprovalFlow from "./flows/approval/ApprovalFlow";
import DepositFlow from "./flows/deposit/DepositFlow";
import LoadingIndicator from "v2/components/LoadingIndicator";

interface Props {
  jar: JarWithData;
}

const FarmsTableRowBodyTransactionControls: FC<Props> = ({ jar }) => {
  const { t } = useTranslation("common");
  const pfcore = useAppSelector(CoreSelectors.selectCore);
  const userModel = useAppSelector(UserSelectors.selectData);

  const isUserModelLoading = useAppSelector(UserSelectors.selectIsFetching);
  const userTokenData = useAppSelector((state) =>
    UserSelectors.selectTokenDataById(state, jar.details.apiKey),
  );
  const data = getUserAssetDataWithPrices(jar, pfcore, userModel);
  const jarTokens = data.depositTokensInJar.tokens;
  const farmTokens = data.depositTokensInFarm.tokens;
  const picklesPending = data.earnedPickles.tokensVisible;

  const userHasJarAllowance = parseInt(userTokenData?.jarAllowance || "0") > 0;

  return (
    <div className="flex">
      <div className="grow border self-start border-foreground-alt-500 rounded-xl p-4 mb-2 sm:mb-0 mr-3 sm:mr-6">
        <p className="font-title text-foreground-alt-200 font-medium text-base leading-5 mb-2">
          {t("v2.farms.depositedToken", { token: jar.depositToken.name })}
        </p>
        <div className="flex items-end justify-between">
          <span className="font-title text-primary font-medium text-base leading-5">
            {jarTokens}
          </span>
          <ApprovalFlow jar={jar} visible={!userHasJarAllowance} />
          <DepositFlow jar={jar} visible={userHasJarAllowance} balances={userTokenData} />
        </div>
      </div>
      <div className="grow border self-start border-foreground-alt-500 rounded-xl p-4 mb-2 sm:mb-0 mr-3 sm:mr-6">
        <p className="font-title text-foreground-alt-200 font-medium text-base leading-5 mb-2">
          {t("v2.farms.stakedToken", { token: jar.depositToken.name })}
        </p>
        <div className="flex items-end justify-between">
          <span className="font-title text-primary font-medium text-base leading-5">
            {farmTokens}
          </span>
          <div className="grid grid-cols-2 gap-3">
            <Button type="secondary" state="disabled" className="w-11">
              +
            </Button>
            <Button type="secondary" state="disabled" className="w-11">
              -
            </Button>
          </div>
        </div>
      </div>
      <div className="grow self-start">
        <div className="border border-foreground-alt-500 rounded-xl p-4">
          <p className="font-title text-foreground-alt-200 font-medium text-base leading-5 mb-2">
            {t("v2.farms.earnedToken", { token: "PICKLEs" })}
          </p>
          <div className="flex items-end justify-between">
            <span className="font-title text-primary font-medium text-base leading-5">
              {picklesPending}
            </span>
            <Button type="primary" state="disabled">
              {t("v2.farms.harvest")}
            </Button>
          </div>
        </div>
        <div className="relative">
          {isUserModelLoading && (
            <LoadingIndicator waitForUserModel className="absolute r-0 t-0 mt-1" />
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmsTableRowBodyTransactionControls;
