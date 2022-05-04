import { FC } from "react";
import { useTranslation } from "next-i18next";
import { BigNumber, ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

import { useAppSelector } from "v2/store";
import { BrineryWithData } from "v2/store/core";
import { UserSelectors } from "v2/store/user";
import LoadingIndicator from "v2/components/LoadingIndicator";
import ApprovalFlow from "../farms/flows/approval/ApprovalFlow";
import DepositFlow from "../farms/flows/deposit/DepositFlow";
import WithdrawFlow from "../farms/flows/withdraw/WithdrawFlow";
import { classNames, roundToSignificantDigits } from "v2/utils";
import HarvestFlow from "../farms/flows/harvest/HarvestFlow";

interface Props {
  brinery: BrineryWithData;
}

const BrineryTableRowBodyTransactionControls: FC<Props> = ({ brinery }) => {
  const { t } = useTranslation("common");
  const { account } = useWeb3React<Web3Provider>();

  const isUserModelLoading = useAppSelector(UserSelectors.selectIsFetching);

  const userBrinery = useAppSelector((state) =>
    UserSelectors.selectBrineryDataById(state, brinery.details.apiKey, account),
  );

  const userHasBrineryAllowance = parseInt(userBrinery?.allowance || "0") > 0;
  const brineryBalance = brinery.brineryBalance.tokens;

  const earnedRewards = brinery.earnedRewards.tokensVisible;

  return (
    <div className="flex space-x-3">
      <div className={"grow self-start"}>
        <div className="border border-foreground-alt-500 rounded-xl p-4">
          <p className="font-title text-foreground-alt-200 font-medium text-base leading-5 mb-2">
            {t("v2.farms.depositedToken", { token: brinery.depositToken.name })}
          </p>
          <div className="flex items-end justify-between">
            <span className="font-title text-primary font-medium text-base leading-5">
              {brineryBalance}
            </span>
            <ApprovalFlow
              apiKey={brinery.details.apiKey}
              tokenAddress={brinery.depositToken.addr}
              tokenName={brinery.depositToken.name}
              spenderAddress={brinery.contract}
              storeAttribute="allowance"
              chainName={brinery.chain}
              visible={!userHasBrineryAllowance}
              type="brinery"
            />
            {userHasBrineryAllowance && (
              <div className="grid grid-cols-2 gap-3">
                <DepositFlow jar={brinery} balances={userBrinery} />
                <WithdrawFlow jar={brinery} balances={userBrinery} />
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
              {roundToSignificantDigits(parseFloat(earnedRewards), 3)}
            </span>
            <HarvestFlow
              rewarderType="farm"
              asset={brinery}
              harvestableAmount={BigNumber.from(parseFloat(earnedRewards) || 0)}
              network={brinery.chain}
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

export default BrineryTableRowBodyTransactionControls;
