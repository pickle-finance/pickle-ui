import { FC, HTMLAttributes } from "react";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";
import { useTranslation } from "next-i18next";
import ReactHtmlParser from "react-html-parser";

import { classNames, formatDollars } from "v2/utils";
import FarmsBadge from "./FarmsBadge";
import { useSelector } from "react-redux";
import { CoreSelectors, JarWithData } from "v2/store/core";
import FarmComponentsIcons from "./FarmComponentsIcons";
import { Network } from "../connection/networks";
import { ChainNetwork } from "picklefinance-core";
import MoreInfo from "v2/components/MoreInfo";

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

const chainProtocol = (jar: JarDefinition, networks: Network[] | undefined): JSX.Element => {
  return (
    <div>
      <p className="font-title font-medium text-base leading-5 group-hover:text-primary-light transition duration-300 ease-in-out">
        {jar.depositToken.name}
      </p>
      <div className="flex mt-1">
        <div className="w-4 h-4 mr-1">
          <Image
            src={formatImagePath(jar.chain, networks)}
            className="rounded-full"
            width={20}
            height={20}
            layout="responsive"
            alt={jar.chain}
            title={jar.chain}
          />
        </div>
        <p className="italic font-normal text-xs text-foreground-alt-200">{jar.protocol}</p>
      </div>
    </div>
  );
};

interface Props {
  simple?: boolean;
  open: boolean;
  jar: JarWithData;
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

const formatAPY = (apy: number) => {
  if (apy === Number.POSITIVE_INFINITY) return "∞%";
  const decimalPlaces = Math.log(apy) / Math.log(10) > 4 ? 0 : 2;
  return apy.toFixed(decimalPlaces) + "%";
};

const FarmsTableRowHeader: FC<Props> = ({ jar, simple, open, userDillRatio }) => {
  const { t } = useTranslation("common");
  const networks = useSelector(CoreSelectors.selectNetworks);

  const totalTokensInJarAndFarm =
    parseFloat(jar.depositTokensInJar.tokens) + parseFloat(jar.depositTokensInFarm.tokens);
  const depositTokenUSD = jar.depositTokensInJar.tokensUSD + jar.depositTokensInFarm.tokensUSD;
  const stakedTokensUSD = jar.depositTokensInFarm.tokensUSD;
  const pendingPicklesAsDollars = jar.earnedPickles.tokensUSD;
  const picklesPending = jar.earnedPickles.tokensVisible;
  const depositTokenCountString = t("v2.farms.tokens", { amount: totalTokensInJarAndFarm });

  let aprRangeString, pickleAprMin, pickleAprMax, pickleApr;
  // Case #1: only jar, no farm
  if (!jar.farm?.details?.farmApyComponents) {
    aprRangeString = (jar.aprStats?.apy || 0).toFixed(3) + "%";
  } else {
    // Case #2: mainnet - show APR range for min/max DILL
    if (jar.farm.details.farmApyComponents[0]?.maxApr && jar.chain === ChainNetwork.Ethereum) {
      pickleAprMin = jar.farm.details.farmApyComponents[0].apr || 0;
      pickleAprMax = jar.farm.details.farmApyComponents[0].maxApr || 0;
      const aprMin = (jar.aprStats?.apy || 0) + pickleAprMin;
      const aprMax = (jar.aprStats?.apy || 0) + pickleAprMax;
      aprRangeString = `${aprMin.toFixed(2)}% ~ ${aprMax.toFixed(2)}%`;
    } else {
      // Case #3: sidechain with pickle farm
      pickleApr = jar.farm.details.farmApyComponents[0]?.apr;
      aprRangeString = `${((jar.aprStats?.apy || 0) + (pickleApr || 0)).toFixed(2)}%`;
    }
  }

  const userStakedNum =
    parseFloat(jar.depositTokensInFarm?.tokens || "0") +
    parseFloat(jar.depositTokensInJar?.tokens || "0");
  const userDerivedBalance = userStakedNum * 0.4;
  const userAdjustedBalance = (jar.farm?.details?.tokenBalance || 0) * userDillRatio * 0.6;
  const userAdjustedPickleApy =
    ((jar.farm?.details?.farmApyComponents?.[0]?.maxApr || 0) *
      Math.min(userStakedNum, userDerivedBalance + userAdjustedBalance)) /
    (userStakedNum || 1);

  const userApy = userAdjustedPickleApy + (jar.aprStats?.apy || 0);
  const userApyString = t("v2.farms.yourApy", { apy: formatAPY(userApy || 0) });

  const { aprStats } = jar;
  const difference = (aprStats?.apy || 0) - (aprStats?.apr || 0);
  let apyRangeTooltipText = `${t("v2.farms.apyUnavailable")}`;
  if (aprStats?.components?.length) {
    apyRangeTooltipText = [
      `${t("farms.baseAPRs")}:`,
      Boolean(pickleApr) && `pickle: ${formatAPY(pickleApr || 0)}`,
      Boolean(pickleAprMin && pickleAprMax) &&
        `pickle: ${formatAPY(pickleAprMin || 0)} ~ ${formatAPY(pickleAprMax || 0)}`,

      ...aprStats.components.map((x) => {
        const k = x.name;
        const v = x.apr;
        return isNaN(v) || v > 1e6 ? null : `${k}: ${v.toFixed(2)}%`;
      }),
      `${t("farms.compounding")}: ${difference.toFixed(2)}%`,
    ]
      .filter((x) => x)
      .join(` <br/> `);
  }

  return (
    <>
      <RowCell className={classNames(!open && "rounded-bl-xl", "rounded-tl-xl flex items-center")}>
        <FarmComponentsIcons jar={jar} />
        {chainProtocol(jar, networks)}
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
        <span className="font-title font-medium text-base leading-5">{aprRangeString}</span>{" "}
        <MoreInfo>
          <span className="text-foreground-alt-200 text-sm">
            {ReactHtmlParser(apyRangeTooltipText)}
          </span>
        </MoreInfo>
        {jar.chain === ChainNetwork.Ethereum && Boolean(userStakedNum) && (
          <p className="font-normal text-xs text-foreground-alt-200">{userApyString}</p>
        )}
      </RowCell>
      <RowCell className={classNames(simple && "rounded-r-xl")}>
        <p className="font-title font-medium text-base leading-5">
          {formatDollars(jar.details.harvestStats?.balanceUSD || 0)}
        </p>
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
