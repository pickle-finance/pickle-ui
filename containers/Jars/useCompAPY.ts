import { ethers } from "ethers";
import { useEffect, useState } from "react";

import { Contracts } from "../Contracts";
import { Connection } from "../Connection";
import { Prices } from "../Prices";
import { formatEther, parseEther } from "ethers/lib/utils";

import { Contract as MulticallContract } from "@0xsequence/multicall";

type Output = {
  APYs: Array<{ [key: string]: number }>;
};

export const useCompAPY = (
  ctokenAddress: string,
  underlyingPrice = 1,
): Output => {
  const { prices } = Prices.useContainer();
  const { provider, blockNum, multicallProvider } = Connection.useContainer();
  const { cToken, comptroller } = Contracts.useContainer();

  const [compSupplyAPY, setCompSupplyAPY] = useState<null | number>(null);
  const [compBorrowAPY, setCompBorrowAPY] = useState<null | number>(null);
  const [supplyRate, setSupplyRate] = useState<null | number>(null);
  const [borrowRate, setBorrowRate] = useState<null | number>(null);

  const getCompAPY = async () => {
    if (
      cToken &&
      comptroller &&
      prices?.comp &&
      blockNum &&
      provider &&
      multicallProvider
    ) {
      const CToken = cToken.attach(ctokenAddress);

      const multicallCToken = new MulticallContract(
        CToken.address,
        CToken.interface.fragments,
      );

      const mutlicallComptroller = new MulticallContract(
        comptroller.address,
        comptroller.interface.fragments,
      );

      const [
        marketBorrowIndex,
        totalBorrows,
        newSupplyRate,
        newBorrowRate,
      ] = await Promise.all([
        CToken.callStatic.borrowIndex(),
        CToken.callStatic.totalBorrows(),
        CToken.callStatic.supplyRatePerBlock(),
        CToken.callStatic.borrowRatePerBlock(),
      ]);

      const [
        supplyState,
        supplySpeed,
        exchangeRate,
        supplyTokens,
        borrowState,
        borrowSpeed,
      ] = await multicallProvider.all([
        mutlicallComptroller.compSupplyState(ctokenAddress),
        mutlicallComptroller.compSpeeds(ctokenAddress),
        multicallCToken.exchangeRateStored(),
        multicallCToken.totalSupply(),
        mutlicallComptroller.compBorrowState(ctokenAddress),
        mutlicallComptroller.compSpeeds(ctokenAddress),
      ]);

      getCompSupplyAPY({
        supplyState,
        supplySpeed,
        exchangeRate,
        supplyTokens,
      });

      getCompBorrowAPY({
        borrowState,
        marketBorrowIndex,
        totalBorrows,
        borrowSpeed,
      });

      getSupplyRate(newSupplyRate);
      getBorrowRate(newBorrowRate);
    }
  };

  const getCompSupplyAPY = async ({
    supplyState,
    supplySpeed,
    exchangeRate,
    supplyTokens,
  }: {
    supplyState: [ethers.BigNumber, number];
    supplySpeed: ethers.BigNumber;
    exchangeRate: ethers.BigNumber;
    supplyTokens: ethers.BigNumber;
  }) => {
    if (prices?.comp && blockNum) {
      const EXP_SCALE = ethers.utils.parseUnits("1", 18);

      // https://github.com/compound-finance/compound-protocol/blob/master/contracts/Comptroller.sol#L1194
      // Supply
      const supplyTokensUnderlying = supplyTokens
        .mul(exchangeRate)
        .div(EXP_SCALE);

      const supplyStateBlock = supplyState[1];
      const deltaBlocks = ethers.BigNumber.from(blockNum - supplyStateBlock);

      const compAccrued = deltaBlocks.mul(supplySpeed);

      const timeAccrued = deltaBlocks.mul(ethers.BigNumber.from(13));

      if (timeAccrued.gt(ethers.constants.Zero)) {
        const compSupplyApyBN = compAccrued
          .mul(parseEther("1"))
          .div(supplyTokensUnderlying)
          .div(timeAccrued)
          .mul(ethers.BigNumber.from(60 * 60 * 24 * 365));

        const newCompSupplyApy =
          (parseFloat(formatEther(compSupplyApyBN)) * prices.comp * 100) /
          underlyingPrice;

        setCompSupplyAPY(newCompSupplyApy);
      }
    }
  };

  const getCompBorrowAPY = async ({
    borrowState,
    marketBorrowIndex,
    totalBorrows,
    borrowSpeed,
  }: {
    borrowState: [ethers.BigNumber, number];
    marketBorrowIndex: ethers.BigNumber;
    totalBorrows: ethers.BigNumber;
    borrowSpeed: ethers.BigNumber;
  }) => {
    if (prices?.comp && blockNum) {
      const EXP_SCALE = ethers.utils.parseUnits("1", 18);

      // https://github.com/compound-finance/compound-protocol/blob/master/contracts/Comptroller.sol#L1217
      // Borrow
      const borrowStateBlock = borrowState[1];
      const deltaBlocks = ethers.BigNumber.from(blockNum - borrowStateBlock);

      const borrowAmount = totalBorrows.mul(EXP_SCALE).div(marketBorrowIndex);

      const compAccrued = deltaBlocks.mul(borrowSpeed);

      // Assume 13 seconds per block
      const timeAccrued = deltaBlocks.mul(ethers.BigNumber.from(13));

      if (timeAccrued.gt(ethers.constants.Zero)) {
        const compBorrowApyBN = compAccrued
          .mul(parseEther("1"))
          .div(borrowAmount)
          .div(timeAccrued)
          .mul(ethers.BigNumber.from(60 * 60 * 24 * 365));

        const newCompBorrowApy =
          (parseFloat(formatEther(compBorrowApyBN)) * prices.comp * 100) /
          underlyingPrice;

        setCompBorrowAPY(newCompBorrowApy * 0.725);
      }
    }
  };

  const getSupplyRate = async (newSupplyRate: ethers.BigNumber) => {
    if (cToken && prices?.comp && blockNum) {
      // 13 seconds per block
      const apy =
        ((parseFloat(formatEther(newSupplyRate)) / 13) *
          60 *
          60 *
          24 *
          365 *
          100) /
        underlyingPrice;

      setSupplyRate(apy);
    }
  };

  const getBorrowRate = async (newBorrowRate: ethers.BigNumber) => {
    if (cToken && prices?.comp && blockNum) {
      // 13 seconds per block
      const apy =
        ((parseFloat(formatEther(newBorrowRate)) / 13) *
          60 *
          60 *
          24 *
          365 *
          100) /
        underlyingPrice;

      setBorrowRate(apy);
    }
  };

  useEffect(() => {
    getCompAPY();
  }, [blockNum]);

  const APYs = [];

  // Doing this so users don't freak out with a "negative" APY
  if (compSupplyAPY && compBorrowAPY && borrowRate) {
    APYs.push({ ["comp (supply)"]: compSupplyAPY });
    APYs.push({ ["comp (borrow)"]: compBorrowAPY });
    APYs.push({ borrow: -borrowRate });
  }

  if (supplyRate) {
    APYs.push({ supply: supplyRate });
  }

  return {
    APYs,
  };
};
