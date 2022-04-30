import { BigNumber } from "@ethersproject/bignumber";
import {
  AssetProtocol,
  JarDefinition,
  PickleModelJson,
} from "picklefinance-core/lib/model/PickleModelJson";
import { UserData } from "picklefinance-core/lib/client/UserModel";

import { bigNumberToTokenNumber, formatNumber } from "../format";
import { tokenDecimals } from "v2/store/core.helpers";

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
  walletComponentTokens: {
    [key: string]: UserAssetDataWithPricesComponent;
  };
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
    tokensVisible: formatNumber(bigNumberToTokenNumber(depositTokenWei, decimals, 3), 3),
    tokensUSD: bigNumberToTokenNumber(weiMulPrice, decimals, 3),
  };
};

const userAssetDataZeroEverything = (): UserAssetDataWithPrices => ({
  assetId: "",
  depositTokensInWallet: userAssetDataZeroComponent(),
  depositTokensInJar: userAssetDataZeroComponent(),
  depositTokensInFarm: userAssetDataZeroComponent(),
  earnedPickles: userAssetDataZeroComponent(),
  walletComponentTokens: {},
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

  let token0,
    token1,
    token0Balance,
    token1Balance,
    walletComponentTokens: { [key: string]: UserAssetDataWithPricesComponent } = {};

  if (jar.protocol === AssetProtocol.UNISWAP_V3) {
    token0 = jar.depositToken.components?.[0];
    token1 = jar.depositToken.components?.[1];

    token0Balance = userTokenDetails.componentTokenBalances[token0 || ""].balance;
    token1Balance = userTokenDetails.componentTokenBalances[token1 || ""].balance;

    const token0Wallet: UserAssetDataWithPricesComponent = createUserAssetDataComponent(
      BigNumber.from(token0Balance?.toString() || "0"),
      tokenDecimals(token0, core),
      core.prices[token0 || 0],
      1.0,
    );

    const token1Wallet: UserAssetDataWithPricesComponent = createUserAssetDataComponent(
      BigNumber.from(token1Balance?.toString() || "0"),
      tokenDecimals(token1, core),
      core.prices[token1 || 0],
      1.0,
    );

    if (token0 && token1) {
      walletComponentTokens[token0] = token0Wallet;
      walletComponentTokens[token1] = token1Wallet;
    }
  }

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
    walletComponentTokens,
  };
};
