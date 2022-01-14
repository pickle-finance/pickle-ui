import { FC, HTMLAttributes } from "react";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/solid";
import {
  JarDefinition,
  PickleAsset,
  PickleModelJson,
} from "picklefinance-core/lib/model/PickleModelJson";

import { bigNumberToTokenNumber, classNames, formatDollars } from "v2/utils";
import FarmsBadge from "./FarmsBadge";
import {
  UserData,
  UserTokenData,
} from "picklefinance-core/lib/client/UserModel";
import { useSelector } from "react-redux";
import { UserSelectors } from "v2/store/user";
import { BigNumber } from "@ethersproject/bignumber";
import { CoreSelectors } from "v2/store/core";

const RowCell: FC<HTMLAttributes<HTMLElement>> = ({ children, className }) => (
  <td
    className={classNames(
      "bg-black-light p-4 whitespace-nowrap text-sm text-white sm:p-6 group-hover:bg-black-lighter transition duration-300 ease-in-out",
      className,
    )}
  >
    {children}
  </td>
);

interface Props {
  simple?: boolean;
  open: boolean;
  jar: JarDefinition;
}
export interface UserAssetDataWithPricesComponent {
  wei: BigNumber;
  tokens: string;
  tokensVisible: string;
  tokensUSD: number;
}
export interface UserAssetDataWithPrices {
  depositTokensInWallet: UserAssetDataWithPricesComponent;
  depositTokensInJar: UserAssetDataWithPricesComponent;
  depositTokensInFarm: UserAssetDataWithPricesComponent;
  earnedPickles: UserAssetDataWithPricesComponent;
}
const userAssetDataZeroComponent = (): UserAssetDataWithPricesComponent => {
  return {
    wei: BigNumber.from(0),
    tokens: "0",
    tokensVisible: "0.00",
    tokensUSD: 0,
  };
};

const createUserAssetDataComponent = (
  wei: BigNumber,
  decimals: number,
  price: number,
  ratio: number,
): UserAssetDataWithPricesComponent => {
  // TODO this will cause problems for some tokens, using only 3 decimals of precission
  const depositTokenWei = wei.mul((ratio * 1e4).toFixed()).div(1e4);
  const weiMulPrice = depositTokenWei.mul((price * 1e8).toFixed()).div(1e8);
  return {
    wei: depositTokenWei,
    tokens: bigNumberToTokenNumber(
      depositTokenWei,
      decimals,
      decimals,
    ).toString(),
    tokensVisible: bigNumberToTokenNumber(
      depositTokenWei,
      decimals,
      3,
    ).toString(),
    tokensUSD: bigNumberToTokenNumber(weiMulPrice, decimals, 3),
  };
};

const userAssetDataZeroEverything = (): UserAssetDataWithPrices => {
  return {
    depositTokensInWallet: userAssetDataZeroComponent(),
    depositTokensInJar: userAssetDataZeroComponent(),
    depositTokensInFarm: userAssetDataZeroComponent(),
    earnedPickles: userAssetDataZeroComponent(),
  };
};
export const getUserAssetDataWithPrices = (
  jar: JarDefinition,
  core: PickleModelJson | undefined,
  userModel: UserData | undefined,
): UserAssetDataWithPrices => {
  if (core === undefined || userModel === undefined) {
    return userAssetDataZeroEverything();
  }
  const userTokenDetails: UserTokenData | undefined = userModel.tokens.find(
    (x) => x.assetKey === jar.details.apiKey,
  );
  if (userTokenDetails === undefined) {
    return userAssetDataZeroEverything();
  }
  const jarDecimals = jar.details.decimals
    ? jar.details.decimals
    : jar.depositToken.decimals
    ? jar.depositToken.decimals
    : 18;
  const wallet: UserAssetDataWithPricesComponent = createUserAssetDataComponent(
    BigNumber.from(userTokenDetails.depositTokenBalance),
    jarDecimals,
    jar.depositToken.price || 0,
    1.0,
  );
  const jarComponent: UserAssetDataWithPricesComponent = createUserAssetDataComponent(
    BigNumber.from(userTokenDetails.pAssetBalance),
    jarDecimals,
    jar.depositToken.price || 0,
    jar.details.ratio || 0,
  );
  const farmComponent: UserAssetDataWithPricesComponent = createUserAssetDataComponent(
    BigNumber.from(userTokenDetails.pStakedBalance),
    jarDecimals,
    jar.depositToken.price || 0,
    jar.details.ratio || 0,
  );
  const pickleComponent: UserAssetDataWithPricesComponent = createUserAssetDataComponent(
    BigNumber.from(userTokenDetails.picklePending),
    18,
    core.prices.pickle || 0,
    1.0,
  );
  return {
    earnedPickles: pickleComponent,
    depositTokensInWallet: wallet,
    depositTokensInJar: jarComponent,
    depositTokensInFarm: farmComponent,
  };
};

const FarmsTableRowHeader: FC<Props> = ({ jar, simple, open }) => {
  const userModel: UserData | undefined = useSelector(UserSelectors.selectData);
  const allCore = useSelector(CoreSelectors.selectCore);
  const data = getUserAssetDataWithPrices(jar, allCore, userModel);
  const totalTokensInJarAndFarm =
    data.depositTokensInJar.tokens + data.depositTokensInFarm.tokens;
  const depositTokenUSD =
    data.depositTokensInJar.tokensUSD + data.depositTokensInFarm.tokensUSD;
  const pendingPicklesAsDollars = data.earnedPickles.tokensUSD;
  const picklesPending = data.earnedPickles.tokensVisible;
  const depositTokenCountString = totalTokensInJarAndFarm + " Tokens";
  const aprRangeString = "42%";

  return (
    <>
      <RowCell
        className={classNames(
          !open && "rounded-bl-xl",
          "rounded-tl-xl flex items-center",
        )}
      >
        <div className="w-9 h-9 rounded-full border-3 border-gray-outline mr-3">
          <Image
            src="/alchemix.png"
            className="rounded-full"
            width={200}
            height={200}
            layout="responsive"
            alt={jar.depositToken.name}
            title={jar.depositToken.name}
          />
        </div>
        <div>
          <p className="font-title font-medium text-base leading-5 group-hover:text-green-light transition duration-300 ease-in-out">
            {jar.depositToken.name}
          </p>
          <p className="italic font-normal text-xs text-gray-light">
            {jar.protocol}
          </p>
        </div>
      </RowCell>
      <RowCell>
        <p className="font-title font-medium text-base leading-5">
          {formatDollars(pendingPicklesAsDollars)}
        </p>
        <p className="font-normal text-xs text-gray-light">
          {picklesPending} PICKLEs
        </p>
      </RowCell>
      <RowCell>
        <div className="flex items-center">
          <FarmsBadge active />
          <div className="ml-2">
            <p className="font-title font-medium text-base leading-5">
              {formatDollars(depositTokenUSD)}
            </p>
            <p className="font-normal text-xs text-gray-light">
              {depositTokenCountString}
            </p>
          </div>
        </div>
      </RowCell>
      <RowCell>
        <p className="font-title font-medium text-base leading-5">
          {aprRangeString}
        </p>
      </RowCell>
      <RowCell className={classNames(simple && "rounded-r-xl")}>
        <p className="font-title font-medium text-base leading-5">
          {formatDollars(jar.details.harvestStats?.balanceUSD || 0)}
        </p>
      </RowCell>
      {!simple && (
        <RowCell
          className={classNames(!open && "rounded-br-xl", "rounded-tr-xl w-10")}
        >
          <div className="flex justify-end pr-3">
            <ChevronDownIcon
              className={classNames(
                open && "transform rotate-180",
                "text-white ml-2 h-5 w-5 transition duration-300 ease-in-out",
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
