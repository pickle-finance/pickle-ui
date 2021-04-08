import { BigNumber, ethers } from "ethers";
import { useEffect, useState } from "react";
import { Connection } from "../../containers/Connection";
import { Contracts } from "../../containers/Contracts";
import { GaugeFactory } from "../../containers/Contracts/GaugeFactory";
import { Erc20 } from "../../containers/Contracts/Erc20";

export const FARM_LP_TO_GAUGE = {
  "0xdc98556Ce24f007A5eF6dC1CE96322d65832A819":
    "0xaAF68b0e70709390F2D79b74Fa51eF01227E6aEC", // PICKLE/ETH
  "0x5eff6d166d66bacbc1bf52e2c54dd391ae6b1f48":
    "0x1603d97339d1DEEdC934f3d046D55Ee004267B35", // pyveCRV/ETH
  "0x1BB74b5DdC1f4fC91D6f9E7906cf68bc93538e33":
    "0xAb02d3562391cfb2E284D2F65592FdEfE9b5aaa4", // p3CRV
  "0x55282dA27a3a02ffe599f6D11314D239dAC89135":
    "0xFfD6AC5c861b39aA6b98e4ae555C9c5C49f5D158", // pSLPDAI
  "0x8c2D16B7F6D3F989eb4878EcF13D695A7d504E43":
    "0x3f5e34044302470E27F44fD117ce9B46A158C0bd", // pSLPUSDC
  "0xa7a37aE5Cb163a3147DE83F15e15D8E5f94D6bCE":
    "0x3d15EB8bdc83B7451d5C242F7C529dD7B40D009c", // pSLPUSDT
  "0xde74b6c547bd574c3527316a2eE30cd8F6041525":
    "0x7F1aDF378f6418C2cc56d9DD40547ecE5777f810", // pSLPWBTC
  "0x3261D9408604CC8607b687980D40135aFA26FfED":
    "0x66E5A4EcE7b6aeC77b248540E445ddfe6fAF0De3", // pSLPYFI
  "0x77C8A58D940a322Aea02dBc8EE4A30350D4239AD":
    "0xB0F31518D5E8A57F20908612fAE75c585348Da2e", // pstETHCRV
  "0x3bcd97dca7b1ced292687c97702725f37af01cac":
    "0x775883f61E56D5Df49752c45C0A70799C048014C", // pUNIMIRUST
  "0x2350fc7268F3f5a6cC31f26c38f706E41547505d":
    "0x8e8127ccD64F8B2eA38F58CB88dBE1DA26b73a18", // pUNIBACDAI
  "0x748712686a78737DA0b7643DF78Fdf2778dC5944":
    "0x87eD8047d60bc2617f2B0cC0c715fCfCD5683618", // pUNIBASv2DAI
};

export const useMigrate = (
  jarToken: Erc20,
  poolIndex: number,
  balance: BigNumber,
) => {
  const { address, signer, blockNum } = Connection.useContainer();
  const { masterchef, erc20 } = Contracts.useContainer();

  const deposit = async () => {
    if (!jarToken || !address || !masterchef || !erc20) return;

    const gaugeAddress =
      FARM_LP_TO_GAUGE[jarToken.address as keyof typeof FARM_LP_TO_GAUGE];
    const gauge = signer && GaugeFactory.connect(gaugeAddress, signer);
    const allowance = await jarToken.allowance(address, gaugeAddress);

    if (balance && !allowance.gte(balance)) {
      const tx = await jarToken.approve(
        gaugeAddress,
        ethers.constants.MaxUint256,
      );
      await tx.wait();
    }

    if (gauge && balance) {
      const tx2 = await gauge.deposit(balance);
      await tx2.wait();
    }
  };

  const withdraw = async () => {
    if (!address || !masterchef || !parseInt(balance.toString())) return;

    const tx = await masterchef.withdraw(poolIndex, balance);
    await tx.wait();
  };

  return { deposit, withdraw };
};
