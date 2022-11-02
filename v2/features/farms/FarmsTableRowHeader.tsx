import { FC, HTMLAttributes } from "react";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { TFunction, useTranslation } from "next-i18next";
import { AssetProtocol, PickleAsset } from "picklefinance-core/lib/model/PickleModelJson";
import dayjs from "dayjs";

import { classNames, formatDollars, formatNumber, roundToSignificantDigits } from "v2/utils";
import FarmsBadge from "./FarmsBadge";
import { useSelector } from "react-redux";
import { AssetWithData, CoreSelectors } from "v2/store/core";
import FarmComponentsIcons from "./FarmComponentsIcons";
import { Network } from "../connection/networks";
import Link from "v2/components/Link";
import FarmAPY from "./FarmAPY";

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

const uniV3Range = (asset: AssetWithData, t: TFunction) => {
  const isUniV3 = asset.protocol === AssetProtocol.UNISWAP_V3;
  const isStable = asset.depositToken.range?.isStable;
  const isNonUsdPegged = asset.depositToken.range?.isNotUsdPegged;

  const dollarSign = isNonUsdPegged || isStable ? "" : "$";

  if (!isUniV3 || !asset.depositToken.range) return <></>;

  // e.g. Range: $1400 <-> $1900
  const rangeString = `${t("v2.farms.range")}: ${dollarSign}${roundToSignificantDigits(
    +(asset.depositToken.range?.lowerUsd || 0),
    isStable ? 3 : 1,
  )} ↔ ${dollarSign}${roundToSignificantDigits(
    +(asset.depositToken.range?.upperUsd || 0),
    isStable ? 3 : 1,
  )}`;

  // e.g. BTC/ETH, only required where there's no USD pairing
  const tokenRatioString = `${
    isNonUsdPegged || isStable
      ? `${asset.depositToken.range?.numeratorToken.toUpperCase()} / ${asset.depositToken.range?.denomToken.toUpperCase()}`
      : ""
  }`;

  return (
    <p className="font-normal text-foreground-alt-200">{`${rangeString} ${tokenRatioString}
    `}</p>
  );
};

const chainProtocol = (
  asset: AssetWithData,
  networks: Network[] | undefined,
  dashboard: boolean | undefined,
  t: TFunction,
): JSX.Element => {
  const analyticsUrl = asset.details?.apiKey ? "/stats?jar=" + asset.details.apiKey : undefined;

  return (
    <div>
      <p className="font-title font-medium text-base leading-5 group-hover:text-primary-light transition duration-300 ease-in-out">
        {asset.depositToken.name}
      </p>
      {dashboard && analyticsUrl && (
        <Link
          href={analyticsUrl as string}
          className="font-bold group-hover:text-primary-light"
          primary
        >
          {t("v2.farms.statsAndDocs")}
        </Link>
      )}
      <div className="flex mt-1">
        <div className="w-4 h-4 mr-1">
          <Image
            src={formatImagePath(asset.chain, networks)}
            className="rounded-full"
            width={20}
            height={20}
            layout="responsive"
            alt={asset.chain}
            title={asset.chain}
          />
        </div>
        <p className="italic font-normal text-xs text-foreground-alt-200">{asset.protocol}</p>
      </div>
      <p>{uniV3Range(asset, t)}</p>
    </div>
  );
};

const tvlDisplay = (asset: PickleAsset, t: TFunction): JSX.Element => {
  const balanceUSD = asset.details.harvestStats?.balanceUSD || 0;
  const formattedBalance = formatDollars(balanceUSD);
  const jarCreated = dayjs.unix(asset.startTimestamp || 0);
  const oneMonthAgo = dayjs().subtract(1, "month");
  const isNew = jarCreated.isAfter(oneMonthAgo);

  const lowBalance = balanceUSD < 1000;
  const highBalance = balanceUSD > 10000;

  //1653026038
  if (!isNew && lowBalance) {
    return <>{`<$1k`}</>;
  }
  if (isNew && !highBalance) {
    return <>{t("v2.farms.new")} ✨</>;
  }
  return <>{formattedBalance}</>;
};

interface Props {
  simple?: boolean;
  dashboard?: boolean;
  open: boolean;
  asset: AssetWithData;
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

const FarmsTableRowHeader: FC<Props> = ({ asset, simple, dashboard, open, userDillRatio }) => {
  const { t } = useTranslation("common");
  const networks = useSelector(CoreSelectors.selectNetworks);

  const totalTokensInJarAndFarm =
    parseFloat(asset.depositTokensInJar.tokens) + parseFloat(asset.depositTokensInFarm.tokens);
  const depositTokenUSD = asset.depositTokensInJar.tokensUSD + asset.depositTokensInFarm.tokensUSD;
  const stakedTokensUSD = asset.depositTokensInFarm.tokensUSD;
  const pendingPicklesAsDollars = asset.earnedPickles.tokensUSD;
  const picklesPending = asset.earnedPickles.tokensVisible;
  const depositTokenCountString = t("v2.farms.tokens", { amount: totalTokensInJarAndFarm });

  return (
    <>
      <RowCell className={classNames(!open && "rounded-bl-xl", "rounded-tl-xl flex items-center")}>
        <FarmComponentsIcons asset={asset} />
        {chainProtocol(asset, networks, dashboard, t)}
      </RowCell>
      <RowCell>
        <p className="font-title font-medium text-base leading-5">
          {formatDollars(pendingPicklesAsDollars)}
        </p>
        <p className="font-normal text-xs text-foreground-alt-200">{picklesPending} PICKLEs</p>
      </RowCell>
      <RowCell>
        <div className="flex items-center">
          <FarmsBadge active={stakedTokensUSD > 0} />
          <div className="ml-2">
            <p className="font-title font-medium text-base leading-5">
              {formatDollars(depositTokenUSD)}
            </p>
            <p className="font-normal text-xs text-foreground-alt-200">{depositTokenCountString}</p>
          </div>
        </div>
      </RowCell>
      <RowCell>
        <FarmAPY asset={asset} userDillRatio={userDillRatio} />
      </RowCell>
      <RowCell className={classNames(simple && "rounded-r-xl")}>
        <p className="font-title font-medium text-base leading-5">{tvlDisplay(asset, t)}</p>
      </RowCell>
      {!simple && (
        <RowCell className={classNames(!open && "rounded-br-xl", "rounded-tr-xl w-10")}>
          <div className="flex justify-end pr-3">
            <ChevronDownIcon
              className={classNames(
                open && "rotate-180",
                "text-foreground ml-2 h-5 w-5 transition duration-300 ease-in-out",
              )}
              aria-hidden="true"
            />
          </div>
        </RowCell>
      )}
    </>
  );
};

export default FarmsTableRowHeader;
