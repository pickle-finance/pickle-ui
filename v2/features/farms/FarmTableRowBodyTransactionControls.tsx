import { FC } from "react";
import { useTranslation } from "next-i18next";
import { BigNumber, ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

import { useAppSelector } from "v2/store";
import { JarWithData } from "v2/store/core";
import { UserSelectors } from "v2/store/user";
import { jarDecimals } from "v2/utils/user";
import { jarSupportsStaking } from "v2/store/core.helpers";
import LoadingIndicator from "v2/components/LoadingIndicator";
import ApprovalFlow from "./flows/approval/ApprovalFlow";
import DepositFlow from "./flows/deposit/DepositFlow";
import WithdrawFlow from "./flows/withdraw/WithdrawFlow";
import StakeFlow from "./flows/stake/StakeFlow";
import UnstakeFlow from "./flows/unstake/UnstakeFlow";
import { classNames, roundToSignificantDigits } from "v2/utils";
import HarvestFlow from "./flows/harvest/HarvestFlow";

interface Props {
  jar: JarWithData;
}

const FarmsTableRowBodyTransactionControls: FC<Props> = ({ jar }) => {
  const { t } = useTranslation("common");
  const { account } = useWeb3React<Web3Provider>();

  const isUserModelLoading = useAppSelector(UserSelectors.selectIsFetching);
  const userTokenData = useAppSelector((state) =>
    UserSelectors.selectTokenDataById(state, jar.details.apiKey, account),
  );

  const decimals = jarDecimals(jar);
  const userHasJarAllowance = parseInt(userTokenData?.jarAllowance || "0") > 0;
  const jarTokens = parseFloat(
    ethers.utils.formatUnits(userTokenData?.pAssetBalance || "0", decimals),
  );
  const farmTokens = parseFloat(
    ethers.utils.formatUnits(userTokenData?.pStakedBalance || "0", decimals),
  );
  const picklePending = parseFloat(
    ethers.utils.formatUnits(userTokenData?.picklePending || "0", 18),
  );
  const userHasFarmAllowance = parseInt(userTokenData?.farmAllowance || "0") > 0;

  return (
    <div className="flex space-x-3">
      <div className={classNames(jarSupportsStaking(jar) ? "grow self-start" : "w-1/2")}>
        <div className="border border-foreground-alt-500 rounded-xl p-4">
          <p className="font-title text-foreground-alt-200 font-medium text-base leading-5 mb-2">
            {t("v2.farms.depositedToken", { token: jar.depositToken.name })}
          </p>
          <div className="flex items-end justify-between">
            <span className="font-title text-primary font-medium text-base leading-5">
              {jarTokens}
            </span>
            <ApprovalFlow
              apiKey={jar.details.apiKey}
              tokenAddress={jar.depositToken.addr}
              tokenName={jar.depositToken.name}
              spenderAddress={jar.contract}
              storeAttribute="jarAllowance"
              chainName={jar.chain}
              visible={!userHasJarAllowance}
              type="jar"
            />
            {userHasJarAllowance && (
              <div className="grid grid-cols-2 gap-3">
                <DepositFlow jar={jar} balances={userTokenData} type="jar" />
                <WithdrawFlow jar={jar} balances={userTokenData} />
              </div>
            )}
          </div>
        </div>
        <div className="relative">
          {!jarSupportsStaking(jar) && isUserModelLoading && (
            <LoadingIndicator waitForUserModel className="absolute r-0 t-0 mt-1" />
          )}
        </div>
      </div>
      {/* Stake and Harvest functions hidden if no staking available */}
      {jarSupportsStaking(jar) && (
        <>
          <div className="grow self-start">
            <div className="border border-foreground-alt-500 rounded-xl p-4">
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
                  type="farm"
                />
                {userHasFarmAllowance && (
                  <div className="grid grid-cols-2 gap-3">
                    <StakeFlow jar={jar} balances={userTokenData} />
                    <UnstakeFlow jar={jar} balances={userTokenData} />
                  </div>
                )}
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
        </>
      )}
    </div>
  );
};

export default FarmsTableRowBodyTransactionControls;
