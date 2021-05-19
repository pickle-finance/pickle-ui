import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";
import { ethers } from "ethers";
import { Connection } from "./Connection";

import { Strategy } from "./Contracts/Strategy";
import { StrategyFactory } from "./Contracts/StrategyFactory";
import { Ctoken } from "./Contracts/Ctoken";
import { CtokenFactory } from "./Contracts/CtokenFactory";
import { Masterchef } from "./Contracts/Masterchef";
import { Controller } from "./Contracts/Controller";
import { Erc20 } from "./Contracts/Erc20";
import { Uniswapv2Pair } from "./Contracts/Uniswapv2Pair";
import { MasterchefFactory } from "./Contracts/MasterchefFactory";
import { StakingRewards } from "./Contracts/StakingRewards";
import { StakingRewardsFactory } from "./Contracts/StakingRewardsFactory";
import { ControllerFactory } from "./Contracts/ControllerFactory";
import { Erc20Factory } from "./Contracts/Erc20Factory";
import { Uniswapv2PairFactory } from "./Contracts/Uniswapv2PairFactory";
import { config } from "./config";

export const COMETH_USDC_WETH_REWARDS =
  "0x1c30Cfe08506BA215c02bc2723C6D310671BAb62";

function useContracts() {
  const {
    signer,
    chainId,
    chainName,
    polygonMulticallProvider,
    multicallProvider,
  } = Connection.useContainer();
  const addresses = config.addresses.Polygon;

  const [pickle, setPickle] = useState<Erc20 | null>(null);
  const [masterchef, setMasterchef] = useState<Masterchef | null>(null);
  const [controller, setController] = useState<Controller | null>(null);

  const providerOrSigner =
    chainName === "Polygon"
      ? signer || multicallProvider
      : polygonMulticallProvider;

  const [cToken, setCToken] = useState<Ctoken | null>(null);

  const [stakingRewards, setStakingRewards] = useState<StakingRewards | null>(
    null,
  );
  const [uniswapv2Pair, setUniswapv2Pair] = useState<Uniswapv2Pair | null>(
    null,
  );
  const [erc20, setERC20] = useState<Erc20 | null>(null);
  const [strategy, setStrategy] = useState<Strategy | null>(null);

  const initContracts = async () => {
    if (providerOrSigner && addresses) {
      setPickle(Erc20Factory.connect(addresses.pickle, providerOrSigner));
      setMasterchef(
        MasterchefFactory.connect(addresses.masterChef, providerOrSigner),
      );
      setController(
        ControllerFactory.connect(addresses.controller, providerOrSigner),
      );
      setStakingRewards(
        StakingRewardsFactory.connect(
          ethers.constants.AddressZero,
          providerOrSigner,
        ),
      );
      setUniswapv2Pair(
        Uniswapv2PairFactory.connect(
          ethers.constants.AddressZero,
          providerOrSigner,
        ),
      );
      setERC20(
        Erc20Factory.connect(ethers.constants.AddressZero, providerOrSigner),
      );
      setCToken(
        CtokenFactory.connect(ethers.constants.AddressZero, providerOrSigner),
      );
      setStrategy(
        StrategyFactory.connect(ethers.constants.AddressZero, providerOrSigner),
      );
    }
  };

  useEffect(() => {
    if (providerOrSigner) initContracts();
  }, [providerOrSigner]);

  return {
    pickle,
    masterchef,
    controller,
    stakingRewards,
    uniswapv2Pair,
    erc20,
    cToken,
    strategy,
  };
}

export const Contracts = createContainer(useContracts);
