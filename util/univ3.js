import { ethers, Contract } from "ethers";
import v3PoolABI from "../containers/ABIs/univ3Pool.json";

import univ3prices from "@thanpolas/univ3prices";
import erc20 from "@studydefi/money-legos/erc20";
import { JAR_DEPOSIT_TOKENS } from "../containers/Jars/jars";
import { NETWORK_NAMES } from "containers/config";

// UniV3 Incentives
export const uniV3Info = {
  // RBN-ETH
  "0x94981F69F7483AF3ae218CbfE65233cC3c60d93a": {
    incentiveKey: [
      "0x6123B0049F904d730dB3C36a31167D9d4121fA6B",
      "0x94981F69F7483AF3ae218CbfE65233cC3c60d93a",
      1633694400,
      1638878400,
      "0xDAEada3d210D2f45874724BeEa03C7d4BBD41674",
    ],
    token0: "0x6123b0049f904d730db3c36a31167d9d4121fa6b",
    token1: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    emissions: 10000000,
    rewardName: "rbn",
  },
};

// Fetches TVL of a XXX/ETH pool and returns prices
export const getPoolData = async (pool, token, provider) => {
  const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

  const wethPrice = await getWETHPrice(provider);
  const poolContract = new ethers.Contract(pool, v3PoolABI, provider);

  const token0 = await poolContract.token0();
  const token1 = await poolContract.token1();
  const data = await poolContract.slot0();

  const spacing = await poolContract.tickSpacing();
  const liquidity = await poolContract.liquidity();
  const ratio = univ3prices([18, 18], data.sqrtPriceX96).toAuto();

  const tokenPrice = token0 === weth ? wethPrice * ratio : wethPrice / ratio;

  const wethContract = new ethers.Contract(weth, erc20.abi, provider);
  const wethBalance = ethers.utils.formatUnits(
    await wethContract.balanceOf(pool),
    18,
  );

  const tokenContract = new ethers.Contract(token, erc20.abi, provider);
  const symbol = await tokenContract.symbol();
  const tokenBalance = ethers.utils.formatUnits(
    await tokenContract.balanceOf(pool),
    18,
  );

  const tvl = tokenBalance * tokenPrice + wethPrice * wethBalance;
  return {
    tokenPrice,
    symbol,
    weth: wethPrice,
    tvl,
    tick: data.tick,
    spacing,
    liquidity: liquidity.toString(),
    token0,
    token1,
  };
};

const jarV3Abi = ["function getProportion() view returns(uint256)"];

export const getProportion = async (jarAddress, signer) => {
  const jarV3 = new ethers.Contract(jarAddress, jarV3Abi, signer);
  return await jarV3.getProportion();
};

export const getWETHPrice = async (provider) => {
  const weth_usdc = "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640";
  const poolContract = new ethers.Contract(weth_usdc, v3PoolABI, provider);
  const data = await poolContract.slot0();
  const ratio = univ3prices([6, 18], data.sqrtPriceX96).toAuto(); // [] token decimals
  return ratio;
};

export const isUniV3 = (address) => {
  return (
    address ===
    JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV3_RBN_ETH.toLowerCase()
  );
};
