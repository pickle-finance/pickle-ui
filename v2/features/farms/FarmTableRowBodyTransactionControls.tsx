import { FC } from "react";
import { useTranslation } from "next-i18next";
import { BigNumber, ethers } from "ethers";

import { useAppSelector } from "v2/store";
import { AssetWithData, CoreSelectors } from "v2/store/core";
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
import { useSelector } from "react-redux";
import HarvestFlow from "./flows/harvest/HarvestFlow";
import { useAccount } from "v2/hooks";
import ZapFlow from "./flows/zap/ZapFlow";
import { getNativeName } from "./flows/utils";
import { ChainNetwork, PickleModelJson } from "picklefinance-core";
import { ChainNativetoken, UserTokenData } from "picklefinance-core/lib/client/UserModel";
import { TokenSelect } from "./flows/deposit/FormUniV3";

interface Props {
  asset: AssetWithData;
}

const FarmsTableRowBodyTransactionControls: FC<Props> = ({ asset }) => {
  const { t } = useTranslation("common");
  const account = useAccount();

  const isUserModelLoading = useAppSelector(UserSelectors.selectIsFetching);

  // TODO: Relying on this only shows zap options for component tokens user holds in wallet - could be improved by persisted options (even with 0 balance)
  const userTokenData = useAppSelector((state) =>
    UserSelectors.selectTokenDataById(state, asset.details.apiKey, account),
  );

  const userNativeData = useAppSelector((state) =>
    UserSelectors.selectNativeTokenDataByChain(state, asset.chain, account),
  );

  const decimals = jarDecimals(asset);
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
      <div className={classNames(jarSupportsStaking(asset) ? "grow self-start" : "w-1/2")}>
        <div className="border border-foreground-alt-500 rounded-xl p-4">
          <p className="font-title text-foreground-alt-200 font-medium text-base leading-5 mb-2">
            {t("v2.farms.depositedToken", { token: asset.depositToken.name })}
          </p>
          <div className="flex items-end justify-between">
            <span className="font-title text-primary font-medium text-base leading-5">
              {jarTokens}
            </span>
            <span className="flex gap-3">
              <ZapFlow
                asset={asset}
                nativeBalances={userNativeData}
                balances={userTokenData}
                type="jar"
              />
              <ApprovalFlow
                apiKey={asset.details.apiKey}
                tokenAddress={asset.depositToken.addr}
                tokenName={asset.depositToken.name}
                spenderAddress={asset.contract}
                storeAttribute="jarAllowance"
                chainName={asset.chain}
                visible={!userHasJarAllowance}
                type="jar"
              />
              {userHasJarAllowance && (
                <div className="grid grid-cols-3 gap-3">
                  <DepositFlow asset={asset} balances={userTokenData} type="jar" />
                  <WithdrawFlow asset={asset} balances={userTokenData} />
                </div>
              )}
            </span>
          </div>
        </div>
        <div className="relative">
          {!jarSupportsStaking(asset) && isUserModelLoading && (
            <LoadingIndicator waitForUserModel className="absolute r-0 t-0 mt-1" />
          )}
        </div>
      </div>
      {/* Stake and Harvest functions hidden if no staking available */}
      {jarSupportsStaking(asset) && (
        <>
          <div className="grow self-start">
            <div className="border border-foreground-alt-500 rounded-xl p-4">
              <p className="font-title text-foreground-alt-200 font-medium text-base leading-5 mb-2">
                {t("v2.farms.stakedToken", { token: asset.depositToken.name })}
              </p>
              <div className="flex items-end justify-between">
                <span className="font-title text-primary font-medium text-base leading-5">
                  {farmTokens}
                </span>
                <ApprovalFlow
                  apiKey={asset.details.apiKey}
                  tokenAddress={asset.contract}
                  tokenName={asset.farm?.farmDepositTokenName}
                  spenderAddress={asset.farm?.farmAddress}
                  storeAttribute="farmAllowance"
                  chainName={asset.chain}
                  visible={!userHasFarmAllowance}
                  type="farm"
                />
                {userHasFarmAllowance && (
                  <div className="grid grid-cols-2 gap-3">
                    <StakeFlow asset={asset} balances={userTokenData} />
                    <UnstakeFlow asset={asset} balances={userTokenData} />
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
                  asset={asset}
                  harvestableAmount={BigNumber.from(userTokenData?.picklePending || 0)}
                  network={asset.chain}
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
