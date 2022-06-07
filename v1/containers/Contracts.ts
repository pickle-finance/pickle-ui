import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";
import { ethers } from "ethers";
import { Connection } from "./Connection";

import { Comptroller } from "./Contracts/Comptroller";
import { Comptroller__factory as ComptrollerFactory } from "./Contracts/factories/Comptroller__factory";
import { Controller } from "./Contracts/Controller";
import { Controller__factory as ControllerFactory } from "./Contracts/factories/Controller__factory";
import { Ctoken } from "./Contracts/Ctoken";
import { Ctoken__factory as CtokenFactory } from "./Contracts/factories/Ctoken__factory";
import { CurveGauge } from "./Contracts/CurveGauge";
import { CurveGauge__factory as CurveGaugeFactory } from "./Contracts/factories/CurveGauge__factory";
import { CurveProxyLogic } from "./Contracts/CurveProxyLogic";
import { CurveProxyLogic__factory as CurveProxyLogicFactory } from "./Contracts/factories/CurveProxyLogic__factory";
import { Dill } from "./Contracts/Dill";
import { Dill__factory as DillFactory } from "./Contracts/factories/Dill__factory";
import { Erc20 } from "./Contracts/Erc20";
import { Erc20__factory as Erc20Factory } from "./Contracts/factories/Erc20__factory";
import { FeeDistributor } from "./Contracts/FeeDistributor";
import { FeeDistributor__factory as FeeDistributorFactory } from "./Contracts/factories/FeeDistributor__factory";
import { FeeDistributorV2 } from "./Contracts/FeeDistributorV2";
import { FeeDistributorV2__factory as FeeDistributorV2Factory } from "./Contracts/factories/FeeDistributorV2__factory";
import { Gauge } from "./Contracts/Gauge";
import { Gauge__factory as GaugeFactory } from "./Contracts/factories/Gauge__factory";
import { GaugeController } from "./Contracts/GaugeController";
import { GaugeController__factory as GaugeControllerFactory } from "./Contracts/factories/GaugeController__factory";
import { GaugeProxy } from "./Contracts/GaugeProxy";
import { GaugeProxy__factory as GaugeProxyFactory } from "./Contracts/factories/GaugeProxy__factory";
import { Instabrine } from "./Contracts/Instabrine";
import { Instabrine__factory as InstabrineFactory } from "./Contracts/factories/Instabrine__factory";
import { Masterchef } from "./Contracts/Masterchef";
import { Masterchef__factory as MasterchefFactory } from "./Contracts/factories/Masterchef__factory";
import { Masterchefv2 } from "./Contracts/Masterchefv2";
import { Masterchefv2__factory as Masterchefv2Factory } from "./Contracts/factories/Masterchefv2__factory";
import { Pool } from "./Contracts/Pool";
import { Pool__factory as PoolFactory } from "./Contracts/factories/Pool__factory";
import { StakingPools } from "./Contracts/StakingPools";
import { YearnRegistry } from "./Contracts/YearnRegistry";
import { YearnRegistry__factory as YearnRegistryFactory } from "./Contracts/factories/YearnRegistry__factory";
import { StakingPools__factory as StakingPoolsFactory } from "./Contracts/factories/StakingPools__factory";
import { StakingRewards } from "./Contracts/StakingRewards";
import { StakingRewards__factory as StakingRewardsFactory } from "./Contracts/factories/StakingRewards__factory";
import { Strategy } from "./Contracts/Strategy";
import { Strategy__factory as StrategyFactory } from "./Contracts/factories/Strategy__factory";
import { SushiChef } from "./Contracts/SushiChef";
import { SushiChef__factory as SushiChefFactory } from "./Contracts/factories/SushiChef__factory";
import { Sorbettiere } from "./Contracts/Sorbettiere";
import { Sorbettiere__factory as SorbettiereFactory } from "./Contracts/factories/Sorbettiere__factory";
import { Uniswapv2Pair } from "./Contracts/Uniswapv2Pair";
import { Uniswapv2Pair__factory as Uniswapv2PairFactory } from "./Contracts/factories/Uniswapv2Pair__factory";
import { Uniswapv2ProxyLogic } from "./Contracts/Uniswapv2ProxyLogic";
import { Uniswapv2ProxyLogic__factory as Uniswapv2ProxyLogicFactory } from "./Contracts/factories/Uniswapv2ProxyLogic__factory";
import { YvboostMigrator } from "./Contracts/YvboostMigrator";
import { YvboostMigrator__factory as YvboostMigratorFactory } from "./Contracts/factories/YvboostMigrator__factory";

import { Minichef } from "./Contracts/Minichef";
import { Minichef__factory as MinichefFatory } from "./Contracts/factories/Minichef__factory";
import { SushiMinichef } from "./Contracts/SushiMinichef";
import { SushiMinichef__factory as SushiMinichefFactory } from "./Contracts/factories/SushiMinichef__factory";
import { Jar } from "./Contracts/Jar";
import { Jar__factory as JarFactory } from "./Contracts/factories/Jar__factory";

import { SushiComplexRewarder } from "./Contracts/SushiComplexRewarder";
import { SushiComplexRewarder__factory as SushiComplexRewarderFactory } from "./Contracts/factories/SushiComplexRewarder__factory";

import { Ironchef } from "./Contracts/Ironchef";
import { Ironchef__factory as IronchefFactory } from "./Contracts/factories/Ironchef__factory";

import { PickleRewarder } from "./Contracts/PickleRewarder";
import { PickleRewarder__factory as PickleRewarderFactory } from "./Contracts/factories/PickleRewarder__factory";

import { StabilityPool } from "./Contracts/StabilityPool";
import { StabilityPool__factory as StabilityPoolFactory } from "./Contracts/factories/StabilityPool__factory";

import { BPAddresses } from "./config";
import { SushiMigrator } from "./Contracts/SushiMigrator";
import { SushiMigrator__factory as SushiMigratorFactory } from "./Contracts/factories/SushiMigrator__factory";
import { FossilFarms } from "./Contracts/FossilFarms";
import { FossilFarms__factory as FossilFarmsFactory } from "./Contracts/factories/FossilFarms__factory";

import { Cherrychef } from "./Contracts/Cherrychef";
import { Cherrychef__factory as CherrychefFactory } from "./Contracts/factories/Cherrychef__factory";

import { Jswapchef } from "./Contracts/Jswapchef";
import { Jswapchef__factory as JswapFactory } from "./Contracts/factories/Jswapchef__factory";

import { CvxBooster } from "./Contracts/CvxBooster";
import { CvxBooster__factory as CvxBoosterFactory } from "./Contracts/factories/CvxBooster__factory";

import { Feichef } from "./Contracts/Feichef";
import { Feichef__factory as FeichefFactory } from "./Contracts/factories/Feichef__factory";
import { RallyRewardPools } from "./Contracts/RallyRewardPools";
import { RallyRewardPools__factory as RallyRewardPoolsFactory } from "./Contracts/factories/RallyRewardPools__factory";
import { DodoPair } from "./Contracts/DodoPair";
import { DodoPair__factory as DodoPairFactory } from "./Contracts/factories/DodoPair__factory";
import { DodoRewards } from "./Contracts/DodoRewards";
import { DodoRewards__factory as DodoRewardsFactory } from "./Contracts/factories/DodoRewards__factory";
import { LooksStaking__factory as LooksStakingFactory } from "v1/containers/Contracts/factories/LooksStaking__factory";
import { LooksStaking } from "./Contracts/LooksStaking";
import { PickleCore } from "./Jars/usePickleCore";
import { ADDRESSES } from "picklefinance-core/lib/model/PickleModel";
import { ChainNetwork } from "picklefinance-core";

import { ControllerUniv3 } from "./Contracts/ControllerUniv3";
import { ControllerUniv3__factory as ControllerUniv3Factory } from "./Contracts/factories/ControllerUniv3__factory";

import { VefxsVault } from "./Contracts/VefxsVault";
import { VefxsVault__factory as VefxsVaultFactory } from "./Contracts/factories/VefxsVault__factory";

export const PICKLE_STAKING_SCRV_REWARDS = "0xd86f33388bf0bfdf0ccb1ecb4a48a1579504dc0a";
export const PICKLE_STAKING_WETH_REWARDS = "0xa17a8883dA1aBd57c690DF9Ebf58fC194eDAb66F";

export const DILL = "0xbBCf169eE191A1Ba7371F30A1C344bFC498b29Cf";

export const COMPTROLLER_ADDR = "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B";

export const PICKLE_TOKEN_ADDR = "0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5";

export const MASTERCHEF_ADDR = "0xbD17B1ce622d73bD438b9E658acA5996dc394b0d";

export const MASTERCHEFV2_ADDR = "0xef0881ec094552b2e128cf945ef17a6752b4ec5d";

export const CONTROLLER_ADDR = "0x6847259b2B3A4c17e7c43C54409810aF48bA5210";

export const UNISWAPV2_PROXY_LOGIC = "0x0a536ca30B9E20a3D89c91c22Ef77E1AeBBd6944";
export const CURVE_PROXY_LOGIC = "0x6186E99D9CFb05E1Fdf1b442178806E81da21dD8";

export const GAUGE_CONTROLLER_ADDR = "0x2F50D538606Fa9EDD2B11E2446BEb18C9D5846bB";

export const SUSD_GAUGE_ADDR = "0xA90996896660DEcC6E997655E065b23788857849";
export const SUSD_POOL_ADDR = "0xA5407eAE9Ba41422680e2e00537571bcC53efBfD";
export const STETH_GAUGE_ADDR = "0x182B723a58739a9c974cFDB385ceaDb237453c28";
export const STETH_POOL_ADDR = "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022";
export const RENBTC_GAUGE_ADDR = "0xB1F2cdeC61db658F091671F5f199635aEF202CAC";
export const RENBTC_POOL_ADDR = "0x93054188d876f558f4a66B2EF1d97d16eDf0895B";
export const THREE_GAUGE_ADDR = "0xbFcF63294aD7105dEa65aA58F8AE5BE2D9d0952A";
export const THREE_POOL_ADDR = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";
export const LUSD_POOL_ADDR = "0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA";
export const FRAX_POOL_ADDR = "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B";
export const IRONBANK_POOL_ADDR = "0x5282a4eF67D9C33135340fB3289cc1711c13638C";
export const CVX_BOOSTER = "0xF403C135812408BFbE8713b5A23a04b3D48AAE31";

export const SUSDV2_DEPOSIT_ADDR = "0xFCBa3E75865d2d561BE8D220616520c171F12851";

export const SUSDV2_CRV = "0xC25a3A3b969415c80451098fa907EC722572917F";
export const THREE_CRV = "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490";
export const RENBTC_CRV = "0x49849C98ae39Fff122806C06791Fa73784FB3675";

export const SORBETTIERE_REWARDS = "0xF43480afE9863da4AcBD4419A47D9Cc7d25A647F";

export const SCRV_STAKING_REWARDS = "0xDCB6A51eA3CA5d3Fd898Fd6564757c7aAeC3ca92";
export const STECRV_STAKING_REWARDS = "0x99ac10631F69C753DDb595D074422a0922D9056B";

export const LQTY_LUSD_ETH_STAKING_REWARDS = "0xd37a77E71ddF3373a79BE2eBB76B6c4808bDF0d5";

export const UNI_ETH_DAI_STAKING_REWARDS = "0xa1484c3aa22a66c62b77e0ae78e15258bd0cb711";
export const UNI_ETH_USDC_STAKING_REWARDS = "0x7fba4b8dc5e7616e59622806932dbea72537a56b";
export const UNI_ETH_USDT_STAKING_REWARDS = "0x6c3e4cb2e96b01f4b866965a91ed4437839a121a";
export const UNI_ETH_WBTC_STAKING_REWARDS = "0xCA35e32e7926b96A9988f61d510E038108d8068e";
export const MIRROR_MIR_UST_STAKING_REWARDS = "0x5d447Fc0F8965cED158BAB42414Af10139Edf0AF";

export const MIRROR_MTSLA_UST_STAKING_REWARDS = "0x43DFb87a26BA812b0988eBdf44e3e341144722Ab";
export const MIRROR_MAAPL_UST_STAKING_REWARDS = "0x735659C8576d88A2Eb5C810415Ea51cB06931696";
export const MIRROR_MQQQ_UST_STAKING_REWARDS = "0xc1d2ca26A59E201814bF6aF633C3b3478180E91F";
export const MIRROR_MSLV_UST_STAKING_REWARDS = "0xDB278fb5f7d4A7C3b83F80D18198d872Bbf7b923";
export const MIRROR_MBABA_UST_STAKING_REWARDS = "0x769325E8498bF2C2c3cFd6464A60fA213f26afcc";

export const FEI_MASTERCHEF = "0x9e1076cC0d19F9B0b8019F384B0a29E48Ee46f7f";

export const FOX_ETH_STAKING_REWARDS = "0xc54B9F82C1c54E9D4d274d633c7523f2299c42A0";

export const ALCHEMIX_ALCX_ETH_STAKING_POOLS = "0xab8e74017a8cc7c15ffccd726603790d26d7deca";

export const COMMUNAL_FARM = "0x0639076265e9f88542C91DCdEda65127974A5CA5";
export const INSTABRINE = "0x8F9676bfa268E94A2480352cC5296A943D5A2809";
export const SUSHI_CHEF = "0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd";
export const GAUGE_PROXY = "0x2e57627ACf6c1812F99e274d0ac61B786c19E74f";
export const FEE_DISTRIBUTOR = "0x74C6CadE3eF61d64dcc9b97490d9FbB231e4BdCc";
export const FEE_DISTRIBUTOR_V2 = "0x2c6C87E7E6195ab7A4f19d3CF31D867580Bb2a1b";

export const YVECRV_ZAP = "0x1fd6ADbA9FEe5c18338F134E31b4a323aFa06AD4";
export const YVBOOST_MIGRATOR = "0x61Dde5da89fB3a099035bd9b3f94d1105A22F3d9";

export const YEARN_REGISTRY = "0x50c1a2eA0a861A967D9d0FFE2AE4012c2E053804";

export const RALLY_REWARD_POOLS = "0x9cf178df8ddb65b9ea7d4c2f5d1610eb82927230";

// Polygon
export const COMETH_USDC_WETH_REWARDS = "0x1c30Cfe08506BA215c02bc2723C6D310671BAb62";
export const COMETH_PICKLE_MUST_REWARDS = "0x52f68a09aee9503367bc0cda0748c4d81807ae9a";
export const COMETH_MATIC_MUST_REWARDS = "0x2328c83431a29613b1780706E0Af3679E3D04afd";
export const FOSSIL_FARMS = "0x1948abc5400aa1d72223882958da3bec643fb4e5";
export const MATIC_COMPLEX_REWARDER = "0xa3378Ca78633B3b9b2255EAa26748770211163AE";

export const AM3CRV_POOL_ADDR = "0x445FE580eF8d70FF569aB36e80c647af338db351";

export const CONTROLLER_MAI = "0x7749fbd85f388f4a186b1d339c2fd270dd0aa647";

export const IRON_CHEF = "0x1fd1259fa8cdc60c6e8c86cfa592ca1b8403dfad";
export const SUSHI_MIGRATOR = "0x16e58463eb9792bc236d8860f5bc69a81e26e32b";
export const PICKLE_ETH_SLP = "0x269db91fc3c7fcc275c2e6f22e5552504512811c";
export const PICKLE_SUSHI_REWARDER = "0x7512105dbb4c0e0432844070a45b7ea0d83a23fd";

export const CHERRYCHEF = "0x8cddB4CD757048C4380ae6A69Db8cD5597442f7b";
export const JSWAPCHEF = "0x83C35EA2C32293aFb24aeB62a14fFE920C2259ab";
export const DODO_REWARDS = "0x06633cd8E46C3048621A517D6bb5f0A84b4919c6";
export const LOOKS_STAKING = "0xBcD7254A1D759EFA08eC7c3291B2E85c5dCC12ce";

export const CONTROLLER_UNIV3 = "0x7B5916C61bCEeaa2646cf49D9541ac6F5DCe3637";
export const VEFXS_VAULT = "0x62826760CC53AE076a7523Fd9dCF4f8Dbb1dA140";

function useContracts() {
  const { signer, chainId, multicallProvider } = Connection.useContainer();
  const { pickleCore } = PickleCore.useContainer();

  const addresses = ADDRESSES.get(
    pickleCore?.chains.find((x) => x.chainId === chainId)?.network as ChainNetwork,
  );

  const [pickle, setPickle] = useState<Erc20 | null>(null);
  const [masterchef, setMasterchef] = useState<Masterchef | null>(null);
  const [masterchefV2, setMasterchefV2] = useState<Masterchefv2 | null>(null);
  const [controller, setController] = useState<Controller | null>(null);
  const [controllerMai, setControllerMai] = useState<Controller | null>(null);

  const providerOrSigner = signer || multicallProvider;

  const [gaugeController, setGaugeController] = useState<GaugeController | null>(null);
  const [susdGauge, setSUSDGauge] = useState<CurveGauge | null>(null);
  const [susdPool, setSUSDPool] = useState<Pool | null>(null);
  const [steCRVGauge, setSteCRVGauge] = useState<CurveGauge | null>(null);
  const [steCRVPool, setSteCRVPool] = useState<Pool | null>(null);
  const [renGauge, setRENGauge] = useState<CurveGauge | null>(null);
  const [renPool, setRENPool] = useState<Pool | null>(null);
  const [threeGauge, setThreeGauge] = useState<CurveGauge | null>(null);
  const [threePool, setThreePool] = useState<Pool | null>(null);
  const [comptroller, setComptroller] = useState<Comptroller | null>(null);
  const [cToken, setCToken] = useState<Ctoken | null>(null);
  const [sushiChef, setSushiChef] = useState<SushiChef | null>(null);
  const [dill, setDill] = useState<Dill | null>(null);
  const [gaugeProxy, setGaugeProxy] = useState<GaugeProxy | null>(null);
  const [gauge, setGauge] = useState<Gauge | null>(null);
  const [feeDistributor, setFeeDistributor] = useState<FeeDistributor | null>(null);
  const [feeDistributorV2, setFeeDistributorV2] = useState<FeeDistributorV2 | null>(null);

  const [stakingRewards, setStakingRewards] = useState<StakingRewards | null>(null);
  const [sorbettiereFarm, setSorbettiereFarm] = useState<Sorbettiere | null>(null);
  const [uniswapv2Pair, setUniswapv2Pair] = useState<Uniswapv2Pair | null>(null);
  const [dodoPair, setDodoPair] = useState<DodoPair | null>(null);
  const [erc20, setERC20] = useState<Erc20 | null>(null);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [curveProxyLogic, setCurveProxyLogic] = useState<CurveProxyLogic | null>(null);
  const [uniswapv2ProxyLogic, setUniswapv2ProxyLogic] = useState<Uniswapv2ProxyLogic | null>(null);

  const [instabrine, setInstabrine] = useState<Instabrine | null>(null);

  const [stakingPools, setStakingPools] = useState<StakingPools | null>(null);
  const [yearnRegistry, setYearnRegistry] = useState<YearnRegistry | null>(null);
  const [lusdPool, setLusdPool] = useState<Pool | null>(null);
  const [fraxPool, setFraxPool] = useState<Pool | null>(null);
  const [ibPool, setIBPool] = useState<Pool | null>(null);
  const [sushiMinichef, setSushiMinichef] = useState<SushiMinichef | null>(null);
  const [minichef, setMinichef] = useState<Minichef | null>(null);
  const [fossilFarms, setFossilFarms] = useState<FossilFarms | null>(null);
  const [sushiComplexRewarder, setSushiComplexRewarder] = useState<SushiComplexRewarder | null>(
    null,
  );

  const [pickleRewarder, setPickleRewarder] = useState<PickleRewarder | null>(null);

  const [pickleSushiRewarder, setPickleSushiRewarder] = useState<PickleRewarder | null>(null);

  const [am3crvPool, setAm3crvPool] = useState<Pool | null>(null);
  const [yvBoostMigrator, setyvBoostMigrator] = useState<YvboostMigrator | null>(null);
  const [pBAMM, setPBAMM] = useState<Jar | null>(null);
  const [stabilityPool, setStabilityPool] = useState<StabilityPool | null>(null);

  const [ironchef, setIronchef] = useState<Ironchef | null>(null);
  const [sushiMigrator, setSushiMigrator] = useState<SushiMigrator | null>(null);

  const [cherrychef, setCherrychef] = useState<Cherrychef | null>(null);
  const [jswapchef, setJswapchef] = useState<Jswapchef | null>(null);

  const [cvxBooster, setCvxBooster] = useState<CvxBooster | null>(null);
  const [jar, setJar] = useState<Jar | null>(null);
  const [feichef, setFeichef] = useState<Feichef | null>(null);

  const [dodoRewards, setDodoRewards] = useState<DodoRewards | null>(null);
  const [looksStaking, setLooksStaking] = useState<LooksStaking | null>(null);

  const [controllerUniV3, setControllerUniV3] = useState<ControllerUniv3 | null>(null);

  const [rallyRewardPools, setRallyRewardPools] = useState<RallyRewardPools | null>(null);

  const [vefxsVault, setVefxsVault] = useState<VefxsVault | null>(null);

  const initContracts = async () => {
    if (providerOrSigner && addresses) {
      setPickle(Erc20Factory.connect(addresses.pickle, providerOrSigner));
      setMasterchef(MasterchefFactory.connect(addresses.masterChef, providerOrSigner));
      setController(ControllerFactory.connect(addresses.controller, providerOrSigner));
      setControllerMai(ControllerFactory.connect(CONTROLLER_MAI, providerOrSigner));
      setMasterchefV2(Masterchefv2Factory.connect(MASTERCHEFV2_ADDR, signer));
      setGaugeController(GaugeControllerFactory.connect(GAUGE_CONTROLLER_ADDR, providerOrSigner));
      setSUSDGauge(CurveGaugeFactory.connect(SUSD_GAUGE_ADDR, providerOrSigner));
      setSUSDPool(PoolFactory.connect(SUSD_POOL_ADDR, providerOrSigner));
      setSteCRVGauge(CurveGaugeFactory.connect(STETH_GAUGE_ADDR, providerOrSigner));
      setSteCRVPool(PoolFactory.connect(STETH_POOL_ADDR, providerOrSigner));
      setRENGauge(CurveGaugeFactory.connect(RENBTC_GAUGE_ADDR, providerOrSigner));
      setRENPool(PoolFactory.connect(RENBTC_POOL_ADDR, providerOrSigner));
      setThreeGauge(CurveGaugeFactory.connect(THREE_GAUGE_ADDR, providerOrSigner));
      setThreePool(PoolFactory.connect(THREE_POOL_ADDR, providerOrSigner));

      setStakingRewards(
        StakingRewardsFactory.connect(ethers.constants.AddressZero, providerOrSigner),
      );
      setSorbettiereFarm(
        SorbettiereFactory.connect(
          addresses.sorbettiere || ethers.constants.AddressZero,
          providerOrSigner,
        ),
      );
      setUniswapv2Pair(
        Uniswapv2PairFactory.connect(ethers.constants.AddressZero, providerOrSigner),
      );
      setDodoPair(DodoPairFactory.connect(ethers.constants.AddressZero, providerOrSigner));
      setERC20(Erc20Factory.connect(ethers.constants.AddressZero, providerOrSigner));
      setJar(JarFactory.connect(ethers.constants.AddressZero, providerOrSigner));
      setCToken(CtokenFactory.connect(ethers.constants.AddressZero, providerOrSigner));
      setComptroller(ComptrollerFactory.connect(COMPTROLLER_ADDR, providerOrSigner));
      setStrategy(StrategyFactory.connect(ethers.constants.AddressZero, providerOrSigner));
      setCurveProxyLogic(CurveProxyLogicFactory.connect(CURVE_PROXY_LOGIC, providerOrSigner));
      setUniswapv2ProxyLogic(
        Uniswapv2ProxyLogicFactory.connect(UNISWAPV2_PROXY_LOGIC, providerOrSigner),
      );
      setInstabrine(InstabrineFactory.connect(INSTABRINE, providerOrSigner));
      setSushiChef(SushiChefFactory.connect(SUSHI_CHEF, providerOrSigner));
      setDill(DillFactory.connect(DILL, providerOrSigner));
      setGaugeProxy(GaugeProxyFactory.connect(GAUGE_PROXY, providerOrSigner));
      setGauge(GaugeFactory.connect(ethers.constants.AddressZero, providerOrSigner));
      setFeeDistributor(FeeDistributorFactory.connect(FEE_DISTRIBUTOR, providerOrSigner));
      setFeeDistributorV2(FeeDistributorV2Factory.connect(FEE_DISTRIBUTOR_V2, providerOrSigner));
      setInstabrine(InstabrineFactory.connect(INSTABRINE, signer));
      setSushiChef(SushiChefFactory.connect(SUSHI_CHEF, signer));
      setDill(DillFactory.connect(DILL, signer));
      setGaugeProxy(GaugeProxyFactory.connect(GAUGE_PROXY, signer));
      setGauge(GaugeFactory.connect(ethers.constants.AddressZero, signer));
      setFeeDistributor(FeeDistributorFactory.connect(FEE_DISTRIBUTOR, signer));
      setFeeDistributorV2(FeeDistributorV2Factory.connect(FEE_DISTRIBUTOR_V2, signer));
      setyvBoostMigrator(YvboostMigratorFactory.connect(YVBOOST_MIGRATOR, signer));
      setStakingPools(StakingPoolsFactory.connect(ALCHEMIX_ALCX_ETH_STAKING_POOLS, signer));
      setYearnRegistry(YearnRegistryFactory.connect(YEARN_REGISTRY, signer));

      setLusdPool(PoolFactory.connect(LUSD_POOL_ADDR, signer));

      setFraxPool(PoolFactory.connect(FRAX_POOL_ADDR, signer));

      setIBPool(PoolFactory.connect(IRONBANK_POOL_ADDR, signer));

      setSushiMinichef(
        SushiMinichefFactory.connect(
          addresses.sushiMinichef || ethers.constants.AddressZero,
          signer,
        ),
      );
      setFossilFarms(FossilFarmsFactory.connect(FOSSIL_FARMS, signer));
      setSushiComplexRewarder(SushiComplexRewarderFactory.connect(MATIC_COMPLEX_REWARDER, signer));
      setPickleRewarder(
        PickleRewarderFactory.connect(addresses.rewarder || ethers.constants.AddressZero, signer),
      );
      setAm3crvPool(PoolFactory.connect(AM3CRV_POOL_ADDR, signer));
      setMinichef(MinichefFatory.connect(addresses.masterChef, signer));
      setPBAMM(JarFactory.connect(BPAddresses.pBAMM, signer));
      setStabilityPool(StabilityPoolFactory.connect(BPAddresses.STABILITY_POOL, signer));

      setIronchef(IronchefFactory.connect(IRON_CHEF, signer));
      setSushiMigrator(SushiMigratorFactory.connect(SUSHI_MIGRATOR, signer));
      setPickleSushiRewarder(PickleRewarderFactory.connect(PICKLE_SUSHI_REWARDER, signer));

      setCherrychef(CherrychefFactory.connect(CHERRYCHEF, signer));
      setJswapchef(JswapFactory.connect(JSWAPCHEF, signer));

      setCvxBooster(CvxBoosterFactory.connect(CVX_BOOSTER, signer));
      setFeichef(FeichefFactory.connect(FEI_MASTERCHEF, signer));
      setRallyRewardPools(RallyRewardPoolsFactory.connect(RALLY_REWARD_POOLS, signer));
      setRallyRewardPools(RallyRewardPoolsFactory.connect(RALLY_REWARD_POOLS, signer));
      setDodoRewards(DodoRewardsFactory.connect(DODO_REWARDS, signer));

      setControllerUniV3(ControllerUniv3Factory.connect(CONTROLLER_UNIV3, signer));

      setVefxsVault(VefxsVaultFactory.connect(VEFXS_VAULT, signer));

      setLooksStaking(LooksStakingFactory.connect(LOOKS_STAKING, signer));
    }
  };

  useEffect(() => {
    if (providerOrSigner) initContracts();
  }, [providerOrSigner]);

  return {
    pickle,
    masterchef,
    masterchefV2,
    controller,
    susdGauge,
    renGauge,
    threeGauge,
    steCRVGauge,
    gaugeController,
    susdPool,
    renPool,
    threePool,
    steCRVPool,
    stakingRewards,
    uniswapv2Pair,
    erc20,
    comptroller,
    cToken,
    strategy,
    uniswapv2ProxyLogic,
    curveProxyLogic,
    instabrine,
    sushiChef,
    sorbettiereFarm,
    dill,
    gaugeProxy,
    gauge,
    feeDistributor,
    feeDistributorV2,
    yvBoostMigrator,
    stakingPools,
    yearnRegistry,
    lusdPool,
    fraxPool,
    ibPool,
    minichef,
    sushiMinichef,
    fossilFarms,
    sushiComplexRewarder,
    am3crvPool,
    pickleRewarder,
    pBAMM,
    stabilityPool,
    controllerMai,
    ironchef,
    sushiMigrator,
    pickleSushiRewarder,
    cherrychef,
    jswapchef,
    cvxBooster,
    jar,
    feichef,
    rallyRewardPools,
    dodoPair,
    dodoRewards,
    controllerUniV3,
    vefxsVault,
    looksStaking,
  };
}

export const Contracts = createContainer(useContracts);
