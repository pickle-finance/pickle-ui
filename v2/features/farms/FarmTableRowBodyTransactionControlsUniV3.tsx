import { FC } from "react";
import { useTranslation } from "next-i18next";
import { BigNumber, ethers } from "ethers";

import { useAppSelector } from "v2/store";
import { CoreSelectors, JarWithData } from "v2/store/core";
import { UserSelectors } from "v2/store/user";
import { getUserAssetDataWithPrices, jarDecimals } from "v2/utils/user";
import ApprovalFlow from "./flows/approval/ApprovalFlow";
import LoadingIndicator from "v2/components/LoadingIndicator";
import WithdrawFlow from "./flows/withdraw/WithdrawFlow";
import ApprovalFlowUniV3 from "./flows/approval/ApprovalFlowUniV3";
import DepositFlowUniV3 from "./flows/deposit/DepositFlowUniV3";
import { useAccount } from "v2/hooks";
import StakeFlow from "./flows/stake/StakeFlow";
import UnstakeFlow from "./flows/unstake/UnstakeFlow";
import { roundToSignificantDigits } from "v2/utils";
import HarvestFlow from "./flows/harvest/HarvestFlow";
import { isAcceptingDeposits } from "v2/store/core.helpers";

interface Props {
  jar: JarWithData;
}

const FarmsTableRowBodyV3TransactionControls: FC<Props> = ({ jar }) => {
  const { t } = useTranslation("common");
  const account = useAccount();
  const pfcore = useAppSelector(CoreSelectors.selectCore);
  const userModel = useAppSelector((state) => UserSelectors.selectData(state, account));

  const isUserModelLoading = useAppSelector(UserSelectors.selectIsFetching);
  const userTokenData = useAppSelector((state) =>
    UserSelectors.selectTokenDataById(state, jar.details.apiKey, account),
  );

  const data = getUserAssetDataWithPrices(jar, pfcore, userModel);
  const farmTokens = data.depositTokensInFarm.tokens;
  const picklePending = parseFloat(
    ethers.utils.formatUnits(userTokenData?.picklePending || "0", 18),
  );
  const extraRewardName = userTokenData?.extraReward?.name;
  const extraRewardPending = parseFloat(
    ethers.utils.formatUnits(userTokenData?.extraReward?.pending || "0", 18),
  );
  const decimals = jarDecimals(jar);
  const jarAllowanceToken0 = userTokenData?.componentTokenBalances[jar.token0?.name!].allowance;
  const jarAllowanceToken1 = userTokenData?.componentTokenBalances[jar.token1?.name!].allowance;
  const userHasJarAllowance =
    parseInt(jarAllowanceToken0 || "0") > 0 && parseInt(jarAllowanceToken1 || "0") > 0;
  const jarTokens = parseFloat(
    ethers.utils.formatUnits(userTokenData?.pAssetBalance || "0", decimals),
  );

  const userHasFarmAllowance = parseInt(userTokenData?.farmAllowance || "0") > 0;

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
          <ApprovalFlowUniV3
            type="jar"
            jar={jar}
            visible={!userHasJarAllowance}
            balances={userTokenData}
            state={isAcceptingDeposits(jar) ? "enabled" : "disabled"}
          />
          {userHasJarAllowance && (
            <div className="grid grid-cols-2 gap-3">
              <DepositFlowUniV3 jar={jar} balances={userTokenData} />
              <WithdrawFlow asset={jar} balances={userTokenData} isUniV3={true} />
            </div>
          )}
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
          <ApprovalFlow
            apiKey={jar.details.apiKey}
            tokenAddress={jar.contract}
            tokenName={jar.farm?.farmDepositTokenName}
            spenderAddress={jar.farm?.farmAddress}
            storeAttribute="farmAllowance"
            chainName={jar.chain}
            visible={!userHasFarmAllowance}
            state={isAcceptingDeposits(jar) ? "enabled" : "disabled"}
            type="farm"
          />
          {userHasFarmAllowance && (
            <div className="grid grid-cols-2 gap-3">
              <StakeFlow asset={jar} balances={userTokenData} />
              <UnstakeFlow asset={jar} balances={userTokenData} />
            </div>
          )}
        </div>
      </div>
      {extraRewardName && (
        <div className="grow self-start">
          <div className="border border-foreground-alt-500 rounded-xl p-4">
            <p className="font-title text-foreground-alt-200 font-medium text-base leading-5 mb-0">
              {t("v2.farms.earnedToken", { token: extraRewardName.toUpperCase() })}
            </p>
            <p className="text-foreground-alt-200 font-medium italic text-xs leading-5 mb-4">
              {t("v2.farms.extraRewardNotice")}
            </p>
            <div className="flex items-end justify-between">
              <span className="font-title text-primary font-medium text-base leading-5">
                {roundToSignificantDigits(extraRewardPending, 3)}
              </span>
            </div>
          </div>
          <div className="relative">
            {isUserModelLoading && (
              <LoadingIndicator waitForUserModel className="absolute r-0 t-0 mt-1" />
            )}
          </div>
        </div>
      )}
      <div className="grow self-start">
        <div className="border border-foreground-alt-500 rounded-xl p-4">
          <p className="font-title text-foreground-alt-200 font-medium text-base leading-5 mb-2">
            {t("v2.farms.earnedToken", { token: "PICKLEs" })}
          </p>
          <div className="flex items-end justify-between">
            <span className="font-title text-primary font-medium text-base leading-5">
              {roundToSignificantDigits(picklePending, 3)}
            </span>
            <HarvestFlow
              rewarderType="farm"
              asset={jar}
              harvestableAmount={BigNumber.from(userTokenData?.picklePending || 0)}
              network={jar.chain}
            />
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

export default FarmsTableRowBodyV3TransactionControls;
