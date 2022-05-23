import { FC } from "react";
import { useTranslation } from "next-i18next";

import { classNames, formatDollars } from "v2/utils";
import FarmsBadge from "../farms/FarmsBadge";
import { useSelector } from "react-redux";
import { BrineryWithData, CoreSelectors, JarWithData } from "v2/store/core";
import FarmComponentsIcons from "../farms/FarmComponentsIcons";
import FarmAPY from "../farms/FarmAPY";
import RowCell from "v2/components/RowCell";
import ChainProtocol from "v2/components/ChainProtocol";

interface Props {
  simple?: boolean;
  open: boolean;
  brinery: BrineryWithData;
  userDillRatio: number;
}

const BrineryTableRowHeader: FC<Props> = ({ brinery, simple, open, userDillRatio }) => {
  const { t } = useTranslation("common");
  const networks = useSelector(CoreSelectors.selectNetworks);

  const depositTokenUSD = brinery.brineryBalance.tokensUSD;
  const rewardsPendingAsDollars = brinery.earnedRewards.tokensUSD;
  const earnedRewards = brinery.earnedRewards.tokensVisible;
  const depositTokenCountString = t("v2.farms.tokens", { amount: brinery.brineryBalance.tokens });

  return (
    <>
      <RowCell className={classNames(!open && "rounded-bl-xl", "rounded-tl-xl flex items-center")}>
        <FarmComponentsIcons asset={brinery} />

        <ChainProtocol asset={brinery} networks={networks} />
      </RowCell>
      <RowCell>
        <p className="font-title font-medium text-base leading-5">
          {formatDollars(rewardsPendingAsDollars)}
        </p>
        <p className="font-normal text-xs text-foreground-alt-200">{`${earnedRewards} ${brinery.depositToken.name}`}</p>
      </RowCell>
      <RowCell>
        <div className="flex items-center">
          <FarmsBadge active={depositTokenUSD > 0} />
          <div className="ml-2">
            <p className="font-title font-medium text-base leading-5">
              {formatDollars(depositTokenUSD)}
            </p>
            <p className="font-normal text-xs text-foreground-alt-200">{depositTokenCountString}</p>
          </div>
        </div>
      </RowCell>
      <RowCell>
        <FarmAPY asset={brinery} userDillRatio={userDillRatio} />
      </RowCell>
      <RowCell className={classNames("rounded-tr-xl")}>
        <p className="font-title font-medium text-base leading-5">
          {formatDollars(brinery.details.harvestStats?.balanceUSD || 0)}
        </p>
      </RowCell>
    </>
  );
};

export default BrineryTableRowHeader;
