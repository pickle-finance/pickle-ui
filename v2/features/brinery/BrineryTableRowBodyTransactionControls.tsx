import { FC } from "react";
import { useTranslation } from "next-i18next";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

import { useAppSelector } from "v2/store";
import { BrineryWithData } from "v2/store/core";
import { UserSelectors } from "v2/store/user";
import LoadingIndicator from "v2/components/LoadingIndicator";
import ApprovalFlow from "../farms/flows/approval/ApprovalFlow";
import DepositFlow from "../farms/flows/deposit/DepositFlow";
import { roundToSignificantDigits } from "v2/utils";
import HarvestFlow from "../farms/flows/harvest/HarvestFlow";
import { isAcceptingDeposits } from "v2/store/core.helpers";
import { useAccount } from "v2/hooks";

interface Props {
  brinery: BrineryWithData;
}

const BrineryTableRowBodyTransactionControls: FC<Props> = ({ brinery }) => {
  const { t } = useTranslation("common");
  const account = useAccount();

  const isUserModelLoading = useAppSelector(UserSelectors.selectIsFetching);

  const userBrinery = useAppSelector((state) =>
    UserSelectors.selectBrineryDataById(state, brinery.details.apiKey, account),
  );

  const userHasBrineryAllowance = parseInt(userBrinery?.allowance || "0") > 0;
  const brineryBalance = brinery.brineryBalance.tokens;

  const earnedRewards = brinery.earnedRewards.tokens;

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
              state={isAcceptingDeposits(brinery) ? "enabled" : "disabled"}
              type="brinery"
            />
            {userHasBrineryAllowance && (
              <div>
                <DepositFlow asset={brinery} balances={userBrinery} type="brinery" />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="grow self-start">
        <div className="border border-foreground-alt-500 rounded-xl p-4">
          <p className="font-title text-foreground-alt-200 font-medium text-base leading-5 mb-2">
            {t("v2.farms.earnedToken", { token: brinery.depositToken.name })}
          </p>
          <div className="flex items-end justify-between">
            <span className="font-title text-primary font-medium text-base leading-5">
              {roundToSignificantDigits(parseFloat(earnedRewards), 3)}
            </span>
            <HarvestFlow
              rewarderType="brinery"
              asset={brinery}
              harvestableAmount={brinery.earnedRewards.wei}
              network={brinery.chain}
              balances={userBrinery}
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
