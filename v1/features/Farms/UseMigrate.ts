import { useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";
import { signERC2612Permit } from "eth-permit";
import { Connection } from "../../containers/Connection";
import { Contracts, PICKLE_ETH_SLP } from "../../containers/Contracts";
import { Gauge__factory as GaugeFactory } from "../../containers/Contracts/factories/Gauge__factory";
import { Erc20 } from "../../containers/Contracts/Erc20";
import { getStats } from "../Zap/useZapper";
import { Gauge } from "../../containers/Contracts/Gauge";
import { PICKLE_ETH_FARM } from "../../containers/Farms/farms";
import { addresses } from "../../containers/SushiPairs";
import { Jar__factory as JarFactory } from "v1/containers/Contracts/factories/Jar__factory";
import { Erc20__factory as Erc20Factory } from "v1/containers/Contracts/factories/Erc20__factory";

export const FARM_LP_TO_GAUGE = {
  "0xdc98556Ce24f007A5eF6dC1CE96322d65832A819": "0xfAA267C3Bb25a82CFDB604136a29895D30fd3fd8", // PICKLE/ETH
  "0x5eff6d166d66bacbc1bf52e2c54dd391ae6b1f48": "0xd3F6732D758008E59e740B2bc2C1b5E420b752c2", // pyveCRV/ETH
  "0xDA481b277dCe305B97F4091bD66595d57CF31634": "0xf5bD1A4894a6ac1D786c7820bC1f36b1535147F6", // p3CRV
  "0x55282dA27a3a02ffe599f6D11314D239dAC89135": "0x6092c7084821057060ce2030F9CC11B22605955F", // pSLPDAI
  "0x8c2D16B7F6D3F989eb4878EcF13D695A7d504E43": "0xd3B37e52Fe5c3193532d4bc8260aeF73dBe3310F", // pSLPUSDC
  "0xa7a37aE5Cb163a3147DE83F15e15D8E5f94D6bCE": "0x421476a3c0338E929cf9B77f7D087533bc9d2a2d", // pSLPUSDT
  "0xde74b6c547bd574c3527316a2eE30cd8F6041525": "0xD55331E7bCE14709d825557E5Bca75C73ad89bFb", // pSLPWBTC
  "0x3261D9408604CC8607b687980D40135aFA26FfED": "0x2E32b1c2D7086DB1620F4586E09BaC7147640838", // pSLPYFI
  "0x77C8A58D940a322Aea02dBc8EE4A30350D4239AD": "0x4731CD18fFfF2C2A43f72eAe1B598dC3c0C16912", // pstETHCRV
  "0x3bcd97dca7b1ced292687c97702725f37af01cac": "0x02c9420467a22ad6067ef0CB4459752F45266C07", // pUNIMIRUST
  "0x2350fc7268F3f5a6cC31f26c38f706E41547505d": "0x46538B9a1541D173A79D19Bc06253CF308137D4D", // pUNIBACDAI
  "0x748712686a78737DA0b7643DF78Fdf2778dC5944": "0x42D0cE01684AA6cE1B1E096cfAb8Ac5E39c7beC4", // pUNIBASv2DAIz
  "0xaFB2FE266c215B5aAe9c4a9DaDC325cC7a497230": "0xd7513F24B4D3672ADD9AF6C739Eb6EeBB85D8dD5", // pUNImTSLAUST
  "0xF303B35D5bCb4d9ED20fB122F5E268211dEc0EBd": "0x2Df015B117343e24AEC9AC99909A4c097a2828Ab", // pUNImAAPLUST
  "0x7C8de3eE2244207A54b57f45286c9eE1465fee9f": "0x3D24b7693A0a5Bf13977b19C81460aEd3f60C150", // pUNImQQQUST
  "0x1ed1fD33b62bEa268e527A622108fe0eE0104C07": "0x1456846B5A7d3c7F9Ea643a4847376fB19fC1aB1", // pUNImSLVUST
  "0x1CF137F651D8f0A4009deD168B442ea2E870323A": "0x6Ea17c249f6cFD434A01c54701A8694766b76594", // pUNImBABAUST
  "0xECb520217DccC712448338B0BB9b08Ce75AD61AE": "0xdaf08622Ce348fdEA09709F279B6F5673B1e0dad", // pSUSHIETH
  "0xC1513C1b0B359Bc5aCF7b772100061217838768B": "0xeA5b46877E2d131405DB7e5155CC15B8e55fbD27", // pUNIFEITRIBE
  "0xCeD67a187b923F0E5ebcc77C7f2F7da20099e378": "0xDA481b277dCe305B97F4091bD66595d57CF31634", // pSUSHIYVBOOST
};

const YVBOOST_GAUGE = "0xDA481b277dCe305B97F4091bD66595d57CF31634";
const YVECRV_GAUGE = " 0xd3F6732D758008E59e740B2bc2C1b5E420b752c2";

export const useMigrate = (
  jarToken: Erc20 | null,
  poolIndex: number,
  balance: BigNumber | null,
  staked: BigNumber | null,
) => {
  const { address, provider, signer, blockNum } = Connection.useContainer();
  const {
    masterchef,
    yvBoostMigrator,
    erc20,
    sushiMigrator,
    masterchefV2,
    looksStaking,
  } = Contracts.useContainer();
  const [looksBalance, setLooksBalance] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));

  const deposit = async () => {
    if (!jarToken || !address) return;

    const gaugeAddress = FARM_LP_TO_GAUGE[jarToken.address as keyof typeof FARM_LP_TO_GAUGE];
    const gauge = signer && GaugeFactory.connect(gaugeAddress, signer);
    const allowance = await jarToken.allowance(address, gaugeAddress);

    if (balance && !allowance.gte(balance)) {
      const tx = await jarToken.approve(gaugeAddress, ethers.constants.MaxUint256);
      await tx.wait();
    }

    if (gauge && balance) {
      const tx2 = await gauge.deposit(balance);
      await tx2.wait();
    }
  };

  const withdraw = async () => {
    if (!address || !masterchef || !parseInt(staked.toString())) return;

    const tx = await masterchef.withdraw(poolIndex, staked);
    await tx.wait();
  };

  const withdrawGauge = async (gauge: Gauge) => {
    if (!address || !gauge || !parseInt(staked.toString())) return;

    const tx = await gauge.exit();
    await tx.wait();
  };

  const migrateYvboost = async () => {
    if (!yvBoostMigrator || !signer || !address || !erc20) return;

    const pSushiEthYveCrvTokenAddress = "0x5Eff6d166D66BacBC1BF52E2C54dD391AE6b1f48";
    const pYvcrvContract = erc20.attach(pSushiEthYveCrvTokenAddress);
    const pYvcrvBalance = await pYvcrvContract.balanceOf(address);

    const allowance = await pYvcrvContract.allowance(address, yvBoostMigrator.address);
    if (pYvcrvBalance && !allowance.gte(pYvcrvBalance)) {
      const tx1 = await jarToken.approve(yvBoostMigrator.address, ethers.constants.MaxUint256);
      await tx1.wait();
    }

    const [yveCrvStats, yvboostStats] = await getStats([
      "pSUSHI ETH / yveCRV-DAO",
      "pSUSHI yveCRV Vault (v2) / ETH",
    ]);

    let minOut;
    if (yveCrvStats && yvboostStats) {
      const yveCrvPrice = yveCrvStats.pricePerToken;
      const yvboostPrice = yvboostStats.pricePerToken;
      minOut = pYvcrvBalance
        .mul(ethers.utils.parseEther(yveCrvPrice.toString()))
        .mul(97)
        .div(100)
        .div(ethers.utils.parseEther(yvboostPrice.toString()));
    } else {
      minOut = pYvcrvBalance.mul(3).div(4);
    }

    const tx2 = await yvBoostMigrator.Migrate(pYvcrvBalance, minOut, {
      gasLimit: 1300000,
    });
    await tx2.wait();
  };

  const depositYvboost = async () => {
    if (!erc20 || !address) return null;

    const pYvBoostEthAddress = "0xCeD67a187b923F0E5ebcc77C7f2F7da20099e378";
    const pYvboostContract = erc20.attach(pYvBoostEthAddress);
    const pYvboostBalance = await pYvboostContract.balanceOf(address);

    const gauge = signer && GaugeFactory.connect(YVBOOST_GAUGE, signer);
    const allowance = await pYvboostContract.allowance(address, YVBOOST_GAUGE);
    if (pYvboostBalance && !allowance.gte(pYvboostBalance)) {
      const tx1 = await pYvboostContract.approve(YVBOOST_GAUGE, ethers.constants.MaxUint256);
      await tx1.wait();
    }

    if (gauge && pYvboostBalance) {
      const tx2 = await gauge.deposit(pYvboostBalance);
      await tx2.wait();
    }
  };

  const migratePickleEth = async () => {
    if (!sushiMigrator || !masterchefV2 || !provider || !address || !erc20) return;

    const pickleEthContract = erc20.attach(PICKLE_ETH_FARM);
    const pickleEthBalance = await pickleEthContract.balanceOf(address);

    if (pickleEthBalance) {
      const permRes = await signERC2612Permit(
        provider,
        pickleEthContract.address,
        address,
        sushiMigrator.address,
        pickleEthBalance.toString(),
      );
      const tx = await sushiMigrator.migrateWithPermit(
        addresses.pickle,
        addresses.weth,
        pickleEthBalance,
        1,
        1,
        permRes.deadline,
        permRes.v,
        permRes.r,
        permRes.s,
        { gasLimit: 400000 },
      );
      await tx.wait();
    }
  };

  const depositPickleEth = async () => {
    if (!erc20 || !address || !masterchefV2) return null;
    const pickleEthSLP = erc20.attach(PICKLE_ETH_SLP);
    const pickleEthSLPBalance = await pickleEthSLP.balanceOf(address);

    const allowance = await pickleEthSLP.allowance(address, masterchefV2.address);
    if (pickleEthSLPBalance && !allowance.gte(pickleEthSLPBalance)) {
      const tx1 = await pickleEthSLP.approve(masterchefV2.address, ethers.constants.MaxUint256);
      await tx1.wait();
    }
    const tx2 = await masterchefV2.deposit(3, pickleEthSLPBalance, address);
    await tx2.wait();
  };

  const withdrawLOOKS = async () => {
    if (!signer || !address || !looksStaking) return;

    const tx = await looksStaking.withdrawAll(true, { gasLimit: 300000 });
    await tx.wait();
  };

  const depositLOOKS = async () => {
    if (!signer || !address || !erc20) return;

    const LOOKS = "0xf4d2888d29d722226fafa5d9b24f9164c092421e";
    const JAR = "0xb4EBc2C371182DeEa04B2264B9ff5AC4F0159C69";
    const looksToken = Erc20Factory.connect(LOOKS, signer);
    const jar = JarFactory.connect(JAR, signer);

    const userBalance = await looksToken.balanceOf(address);
    const allowance = await looksToken.allowance(address, JAR);
    if (!allowance.gte(userBalance)) {
      const tx1 = await looksToken.approve(JAR, ethers.constants.MaxUint256);
      await tx1.wait();
    }
    const tx = await jar.depositAll({
      gasLimit: 250000,
    });
    await tx.wait();
  };

  useEffect(() => {
    const setLooks = async () => {
      if (!looksStaking || !address) return null;
      const balance = await looksStaking.calculateSharesValueInLOOKS(address);
      setLooksBalance(balance);
    };
    setLooks();
  }, [blockNum]);

  return {
    deposit,
    withdraw,
    migrateYvboost,
    depositYvboost,
    withdrawGauge,
    migratePickleEth,
    depositPickleEth,
    withdrawLOOKS,
    depositLOOKS,
    looksBalance,
  };
};
