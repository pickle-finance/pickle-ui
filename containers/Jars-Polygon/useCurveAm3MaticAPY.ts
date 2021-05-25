import { Contract } from "ethers";
import { useEffect, useState } from "react";

import { Prices } from "../Prices";
import { Jar } from "./useFetchJars";

import { Connection } from "../Connection";
import { Contracts } from "../Contracts-Polygon";
import { JAR_DEPOSIT_TOKENS } from "./jars";

export interface JarApy {
  [k: string]: number;
}

export interface JarWithAPY extends Jar {
  totalAPY: number;
  APYs: Array<JarApy>;
}

type Input = Array<Jar> | null;
type Output = {
  APYs: Array<{ [key: string]: number }>;
};

const getCompoundingAPY = (apr: number) => {
  return 100 * (Math.pow(1 + apr / 365, 365) - 1);
};

const swap_abi = ["function balances(uint256) view returns(uint256)"];

const aaveContracts = {
  N_COINS: 3,
  is_aave: true,
  coin_precisions: [1e18, 1e6, 1e6],
  wrapped_precisions: [1e18, 1e6, 1e6],
  use_lending: [false, false, false],
  tethered: [false, false, true],
  is_plain: [false, false, false],
  swap_address: "0x445FE580eF8d70FF569aB36e80c647af338db351",
  token_address: "0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171",
  gauge_address: "0xe381C25de995d62b453aF8B931aAc84fcCaa7A62",
  underlying_coins: [
    "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
  ],
  coins: [
    "0x27F8D03b3a2196956ED754baDc28D73be8830A6e",
    "0x1a13F4Ca1d028320A707D99520AbFefca3998b7F",
    "0x60D55F02A771d515e077c9C2403a1ef324885CeC",
  ],
  swap_abi: swap_abi,
  // sCurveRewards_abi: paaveRewardsabi,
  sCurveRewards_address: "0xBdFF0C27dd073C119ebcb1299a68A6A92aE607F0",
  reward_token: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
};

export const useCurveAm3MaticAPY = (): Output => {
  const {
    multicallProvider,
  } = Connection.useContainer();
  const { prices } = Prices.useContainer();
  const { erc20 } = Contracts.useContainer();

  const [maticAPY, setMaticAPY] = useState<number | null>(null);

  const getMaticAPY = async () => {
    if (multicallProvider && erc20 && prices?.snx) {
      const now = Date.now() / 1000;
      const statsAave = await (
        await fetch(
          `https://aave-api-v2.aave.com/data/markets-data/0xd05e3e715d945b59290df0ae8ef85c1bdb684744`,
        )
      ).json();

      const lpToken = new Contract(
        JAR_DEPOSIT_TOKENS.AM3CRV,
        erc20.interface,
        multicallProvider,
      );
      const swap = new Contract(
        aaveContracts.swap_address,
        aaveContracts.swap_abi,
        multicallProvider,
      );

      const aaveApys: number[] = [];
      aaveContracts.underlying_coins.map(async (coinAddress) => {
        const coinData = statsAave.reserves.find(
          ({ underlyingAsset }: { underlyingAsset: string }) =>
            underlyingAsset === coinAddress,
        );
        aaveApys.push(coinData.aIncentivesAPY);
      });

      const [
        balance0,
        balance1,
        balance2,
        lpSupply,
        lpBalance,
      ] = await Promise.all([
        swap.balances(0),
        swap.balances(1),
        swap.balances(2),
        lpToken.totalSupply(),
        lpToken.balanceOf(aaveContracts.gauge_address),
      ]);

      const totalBalance =
        balance0 / aaveContracts.coin_precisions[0] +
        balance1 / aaveContracts.coin_precisions[1] +
        balance2 / aaveContracts.coin_precisions[2];
      const totalSupply = lpSupply / 10 ** 18;
      const stakedBalance = lpBalance / 10 ** 18;
      const averageApy =
        aaveApys[0] * (balance0 / aaveContracts.coin_precisions[0]) +
        aaveApys[1] * (balance1 / aaveContracts.coin_precisions[1]) +
        aaveApys[2] * (balance2 / aaveContracts.coin_precisions[2]);
      const maticAPY =
        (((averageApy * 100) / totalBalance) * totalSupply) / stakedBalance;

      const timestampEndMaticRewards = 1624389721;
      const wmaticRewardsAmount =
        timestampEndMaticRewards < now
          ? 0
          : ((prices.matic * 12020000 * 6) / stakedBalance) * 100;

      setMaticAPY(maticAPY + wmaticRewardsAmount);
    }
  };

  useEffect(() => {
    getMaticAPY();
  }, [prices]);

  return {
    APYs: [
      { matic: getCompoundingAPY((maticAPY || 0) / 100), apr: maticAPY || 0 },
    ],
  };
};
