import { BigNumber } from "@ethersproject/bignumber";
import {
  AssetProtocol,
  BrineryDefinition,
  PickleModelJson,
} from "picklefinance-core/lib/model/PickleModelJson";
import { UserData } from "picklefinance-core/lib/client/UserModel";

import { bigNumberToTokenNumber, formatNumber } from "../format";
import { Asset, isJar, tokenDecimals } from "v2/store/core.helpers";

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

export interface UserBrineryDataWithPrices {
  assetId: string;
  depositTokensInWallet: UserAssetDataWithPricesComponent;
  brineryBalance: UserAssetDataWithPricesComponent;
  earnedRewards: UserAssetDataWithPricesComponent;
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
  const log = price ? Math.log(price) / Math.log(10) : 0;
  const precisionAdjust = log > 4 ? 0 : 5 - Math.floor(log);
  const precisionAsNumber = Math.pow(10, precisionAdjust);
  const tokenPriceWithPrecision = (price * precisionAsNumber).toFixed();

  const depositTokenWei = wei.mul((ratio * 1e4).toFixed()).div(1e4);
  const weiMulPrice = depositTokenWei
    .mul(tokenPriceWithPrecision)
    .div(precisionAsNumber.toString());

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

const userBrineryDataZeroEverything = (assetId: string): UserBrineryDataWithPrices => ({
  assetId: assetId,
  depositTokensInWallet: userAssetDataZeroComponent(),
  brineryBalance: userAssetDataZeroComponent(),
  earnedRewards: userAssetDataZeroComponent(),
});

export const jarDecimals = (asset: Asset): number => {
  if (!isJar(asset)) return 18;

  return asset.details.decimals
    ? asset.details.decimals
    : asset.depositToken.decimals
    ? asset.depositToken.decimals
    : 18;
};

export const getUserAssetDataWithPrices = (
  asset: Asset,
  core: PickleModelJson | undefined,
  userModel: UserData | undefined,
): UserAssetDataWithPrices => {
  if (core === undefined || userModel === undefined) {
    return userAssetDataZeroEverything();
  }
  const userTokenDetails = userModel.tokens[asset.details.apiKey.toLowerCase()];
  if (userTokenDetails === undefined) return userAssetDataZeroEverything();

  const decimals = jarDecimals(asset);

  let token0,
    token1,
    token0Balance: string,
    token1Balance: string,
    walletComponentTokens: { [key: string]: UserAssetDataWithPricesComponent } = {};

  if (asset.protocol === AssetProtocol.UNISWAP_V3) {
    token0 = asset.depositToken.components?.[0];
    token1 = asset.depositToken.components?.[1];

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
    asset.depositToken.price || 0,
    1.0,
  );

  const jarComponent: UserAssetDataWithPricesComponent = createUserAssetDataComponent(
    BigNumber.from(userTokenDetails.pAssetBalance),
    decimals,
    asset.depositToken.price || 0,
    isJar(asset) ? asset.details.ratio || 1 : 1,
  );

  const farmComponent: UserAssetDataWithPricesComponent = createUserAssetDataComponent(
    BigNumber.from(userTokenDetails.pStakedBalance),
    decimals,
    asset.depositToken.price || 0,
    isJar(asset) ? asset.details.ratio || 1 : 1,
  );

  const pickleComponent: UserAssetDataWithPricesComponent = createUserAssetDataComponent(
    BigNumber.from(userTokenDetails.picklePending),
    18,
    core.prices.pickle || 0,
    1.0,
  );

  return {
    assetId: asset.details.apiKey,
    earnedPickles: pickleComponent,
    depositTokensInWallet: wallet,
    depositTokensInJar: jarComponent,
    depositTokensInFarm: farmComponent,
    walletComponentTokens,
  };
};

export const getUserBrineryDataWithPrices = (
  brinery: BrineryDefinition,
  core: PickleModelJson | undefined,
  userModel: UserData | undefined,
): UserBrineryDataWithPrices => {
  const brineryKey =
    brinery && brinery.details && brinery.details.apiKey
      ? brinery.details.apiKey.toLowerCase()
      : undefined;
  if (
    core === undefined ||
    userModel === undefined ||
    userModel.brineries === undefined ||
    brineryKey === undefined
  ) {
    return userBrineryDataZeroEverything(brineryKey || "");
  }

  const userBrineryDetails = userModel.brineries[brineryKey];
  const depositToken = core.tokens.find(
    (x) => x.contractAddr === brinery.depositToken.addr.toLowerCase(),
  );

  const wallet: UserAssetDataWithPricesComponent = createUserAssetDataComponent(
    BigNumber.from(userBrineryDetails?.depositTokenBalance || "0"),
    depositToken?.decimals || 18,
    depositToken?.price || 0,
    1.0,
  );

  const brineryBalance: UserAssetDataWithPricesComponent = createUserAssetDataComponent(
    BigNumber.from(userBrineryDetails?.balance || "0"),
    depositToken?.decimals || 18,
    depositToken?.price || 0,
    1.0,
  );

  const earnedRewards: UserAssetDataWithPricesComponent = createUserAssetDataComponent(
    BigNumber.from(userBrineryDetails?.claimable || "0"),
    depositToken?.decimals || 18,
    depositToken?.price || 0,
    1.0,
  );

  return {
    assetId: brinery.details.apiKey,
    depositTokensInWallet: wallet,
    brineryBalance,
    earnedRewards,
  };
};
