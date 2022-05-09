import { FC, HTMLAttributes } from "react";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { useTranslation } from "next-i18next";

import { classNames, formatDollars } from "v2/utils";
import FarmsBadge from "./FarmsBadge";
import { useSelector } from "react-redux";
import { CoreSelectors, JarWithData } from "v2/store/core";
import FarmComponentsIcons from "./FarmComponentsIcons";
import { Network } from "../connection/networks";
import FarmAPY from "./FarmAPY";
import ChainProtocol from "v2/components/ChainProtocol";

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

interface Props {
  simple?: boolean;
  open: boolean;
  jar: JarWithData;
  userDillRatio: number;
}

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

  return (
    <>
      <RowCell className={classNames(!open && "rounded-bl-xl", "rounded-tl-xl flex items-center")}>
        <FarmComponentsIcons jar={jar} />
        <ChainProtocol asset={jar} networks={networks} />
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
        <FarmAPY jarOrBrinery={jar} userDillRatio={userDillRatio} />
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
