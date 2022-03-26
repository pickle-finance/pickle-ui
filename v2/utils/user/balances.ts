import { BigNumber } from "@ethersproject/bignumber";
import { JarDefinition, PickleModelJson } from "picklefinance-core/lib/model/PickleModelJson";
import { UserData } from "picklefinance-core/lib/client/UserModel";

import { bigNumberToTokenNumber } from "../format";

export interface UserAssetDataWithPricesComponent {
  wei: BigNumber;
  tokens: string;
  tokensVisible: string;
  tokensUSD: number;
}

export interface UserAssetDataWithPrices {
  assetId: string;
  depositTokensInWallet: UserAssetDataWithPricesComponent;
  depositTokensInJar: UserAssetDataWithPricesComponent;
  depositTokensInFarm: UserAssetDataWithPricesComponent;
  earnedPickles: UserAssetDataWithPricesComponent;
}

const userAssetDataZeroComponent = (): UserAssetDataWithPricesComponent => ({
  wei: BigNumber.from(0),
  tokens: "0",
  tokensVisible: "0.00",
  tokensUSD: 0,
});

const createUserAssetDataComponent = (
  wei: BigNumber,
  decimals: number,
  price: number,
  ratio: number,
): UserAssetDataWithPricesComponent => {
  const log = Math.log(price) / Math.log(10);
  const precisionAdjust = log > 4 ? 0 : 5 - Math.floor(log);
  const precisionAsNumber = Math.pow(10, precisionAdjust);
  const tokenPriceWithPrecision = (price * precisionAsNumber).toFixed();

  const depositTokenWei = wei.mul((ratio * 1e4).toFixed()).div(1e4);
  const weiMulPrice = depositTokenWei.mul(tokenPriceWithPrecision).div(precisionAsNumber);

  return {
    wei: depositTokenWei,
    tokens: bigNumberToTokenNumber(depositTokenWei, decimals, decimals).toString(),
    tokensVisible: bigNumberToTokenNumber(depositTokenWei, decimals, 3).toString(),
    tokensUSD: bigNumberToTokenNumber(weiMulPrice, decimals, 3),
  };
};

const userAssetDataZeroEverything = (): UserAssetDataWithPrices => ({
  assetId: "",
  depositTokensInWallet: userAssetDataZeroComponent(),
  depositTokensInJar: userAssetDataZeroComponent(),
  depositTokensInFarm: userAssetDataZeroComponent(),
  earnedPickles: userAssetDataZeroComponent(),
});

export const jarDecimals = (jar: JarDefinition): number =>
  jar.details.decimals
    ? jar.details.decimals
    : jar.depositToken.decimals
    ? jar.depositToken.decimals
    : 18;

export const getUserAssetDataWithPrices = (
  jar: JarDefinition,
  core: PickleModelJson | undefined,
  userModel: UserData | undefined,
): UserAssetDataWithPrices => {
  if (core === undefined || userModel === undefined) {
    return userAssetDataZeroEverything();
  }
  const userTokenDetails = userModel.tokens[jar.details.apiKey.toLowerCase()];

  if (userTokenDetails === undefined) return userAssetDataZeroEverything();

  const decimals = jarDecimals(jar);

  const wallet: UserAssetDataWithPricesComponent = createUserAssetDataComponent(
    BigNumber.from(userTokenDetails.depositTokenBalance),
    decimals,
    jar.depositToken.price || 0,
    1.0,
  );

  const jarComponent: UserAssetDataWithPricesComponent = createUserAssetDataComponent(
    BigNumber.from(userTokenDetails.pAssetBalance),
    decimals,
    jar.depositToken.price || 0,
    jar.details.ratio || 0,
  );

  const farmComponent: UserAssetDataWithPricesComponent = createUserAssetDataComponent(
    BigNumber.from(userTokenDetails.pStakedBalance),
    decimals,
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
    assetId: jar.details.apiKey,
    earnedPickles: pickleComponent,
    depositTokensInWallet: wallet,
    depositTokensInJar: jarComponent,
    depositTokensInFarm: farmComponent,
  };
};
