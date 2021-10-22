import { ethers, Contract } from "ethers";
import v3PoolABI from '../containers/ABIs/univ3Pool.json'

import univ3prices from '@thanpolas/univ3prices'
import erc20 from "@studydefi/money-legos/erc20";

// Fetches TVL of a XXX/ETH pool and returns prices
export const getPoolData = async (pool, token, provider) => {
  const weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

  const wethPrice = await getWETHPrice(provider)
  const poolContract = new ethers.Contract(pool, v3PoolABI, provider)

  const token0 = await poolContract.token0()
  const data = await poolContract.slot0()

  const spacing = await poolContract.tickSpacing()
  const liquidity = await poolContract.liquidity()
  const ratio = univ3prices([18, 18], data.sqrtPriceX96).toAuto()

  const tokenPrice = token0 === weth ? wethPrice * ratio : wethPrice / ratio

  const wethContract = new ethers.Contract(weth, erc20.abi, provider)
  const wethBalance = ethers.utils.formatUnits(
    await wethContract.balanceOf(pool),
    18
  )

  const tokenContract = new ethers.Contract(token, erc20.abi, provider)
  const symbol = await tokenContract.symbol()
  const tokenBalance = ethers.utils.formatUnits(
    await tokenContract.balanceOf(pool),
    18
  )

  const tvl = tokenBalance * tokenPrice + wethPrice * wethBalance
  return {
    token: tokenPrice,
    symbol,
    weth: wethPrice,
    tvl,
    tick: data.tick,
    spacing,
    liquidity: liquidity.toString()
  }
}

export const getWETHPrice = async (provider) => {
  const weth_usdc = '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640'
  const poolContract = new ethers.Contract(weth_usdc, v3PoolABI, provider)
  const data = await poolContract.slot0()
  const ratio = univ3prices([6, 18], data.sqrtPriceX96).toAuto() // [] token decimals
  return ratio
}
