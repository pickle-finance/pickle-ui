import { FC, HTMLAttributes } from "react";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { BrineryDefinition, JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";
import { useTranslation } from "next-i18next";

import { classNames, formatDollars } from "v2/utils";
import FarmsBadge from "../farms/FarmsBadge";
import { useSelector } from "react-redux";
import { BrineryWithData, CoreSelectors, JarWithData } from "v2/store/core";
import FarmComponentsIcons from "../farms/FarmComponentsIcons";
import { Network } from "../connection/networks";
import FarmAPY from "../farms/FarmAPY";

const RowCell: FC<HTMLAttributes<HTMLElement>> = ({ children, className }) => (
  <td
    className={classNames(
      "bg-background-light p-4 whitespace-nowrap text-sm text-foreground sm:p-6 group-hover:bg-background-lightest transition duration-300 ease-in-out",
      className,
    )}
  >
    {children}
  </td>
);

const chainProtocol = (brinery: BrineryDefinition, networks: Network[] | undefined): JSX.Element => {
  return (
    <div>
      <p className="font-title font-medium text-base leading-5 group-hover:text-primary-light transition duration-300 ease-in-out">
        {brinery.depositToken.name}
      </p>
      <div className="flex mt-1">
        <div className="w-4 h-4 mr-1">
          <Image
            src={formatImagePath(brinery.chain, networks)}
            className="rounded-full"
            width={20}
            height={20}
            layout="responsive"
            alt={brinery.chain}
            title={brinery.chain}
          />
        </div>
        <p className="italic font-normal text-xs text-foreground-alt-200">{brinery.protocol}</p>
      </div>
    </div>
  );
};

interface Props {
  simple?: boolean;
  open: boolean;
  brinery: BrineryWithData;
  userDillRatio: number;
}

const formatImagePath = (chain: string, networks: Network[] | undefined): string => {
  const thisNetwork = networks?.find((network) => network.name === chain);
  if (thisNetwork) {
    return `/networks/${thisNetwork.name}.png`;
  } else {
    return "/pickle.png";
  }
};

const BrineryTableRowHeader: FC<Props> = ({ brinery, simple, open, userDillRatio }) => {
  const { t } = useTranslation("common");
  const networks = useSelector(CoreSelectors.selectNetworks);

  const depositTokenUSD = brinery.brineryBalance.tokensUSD
  const rewardsPendingAsDollars = brinery.earnedRewards.tokensUSD;
  const earnedRewards = brinery.earnedRewards.tokensVisible;
  const depositTokenCountString = t("v2.farms.tokens", { amount: brinery.brineryBalance.tokens });

  return (
    <>
      <RowCell className={classNames(!open && "rounded-bl-xl", "rounded-tl-xl flex items-center")}>
        <FarmComponentsIcons jar={brinery} />
        {chainProtocol(brinery, networks)}
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
        <FarmAPY jarOrBrinery={brinery} userDillRatio={userDillRatio} />
      </RowCell>
      <RowCell className={classNames(simple && "rounded-r-xl")}>
        <p className="font-title font-medium text-base leading-5">
          {formatDollars(brinery.details.harvestStats?.balanceUSD || 0)}
        </p>
      </RowCell>
    </>
  );
};

export default BrineryTableRowHeader;
