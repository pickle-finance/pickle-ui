import { BigNumber, ethers } from "ethers";
import { Connection } from "../../containers/Connection";
import { Contracts } from "../../containers/Contracts";
import { PICKLE_JARS } from "../../containers/Jars/jars";
import { TokenSymbol } from "./useBalance";

const { parseUnits } = ethers.utils;
const { Zero, MaxUint256 } = ethers.constants;

const TOKEN = {
  renBTC: "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d",
  wBTC: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  ETH: "",
  CRV: "0xD533a949740bb3306d119CC777fa900bA034cd52"
};

const CURVE_POOLS = {
  ren: "0x93054188d876f558f4a66B2EF1d97d16eDf0895B",
  "3pool": "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",
};

const CURVE_LP = {
  ren: "0x49849C98ae39Fff122806C06791Fa73784FB3675",
  "3pool": "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",
};

export const useDeposit = (
  inputToken: TokenSymbol,
  rawAmount: string,
  decimals: number | null,
) => {
  const { address } = Connection.useContainer();
  const { instabrine, erc20, masterchef, yveCrvZap } = Contracts.useContainer();
  const approve = async () => {
    if (!instabrine || !yveCrvZap || !inputToken || !decimals || !erc20 || !address) return;
    const isZap = inputToken === "CRV";
    const amount = parseUnits(rawAmount, decimals);
    const token = erc20.attach(TOKEN[inputToken]);
    let allowance;
    if(isZap){
      allowance = await token.allowance(address, yveCrvZap.address);
    }
    else{
      allowance = await token.allowance(address, instabrine.address);
    }
    if (!allowance.gte(amount) && !isZap) {
      const tx = await token.approve(instabrine.address, MaxUint256);
      await tx.wait();
    }
    if (!allowance.gte(amount) && isZap) { // ETH yveCRV zap
      console.log("ZAP TIME",allowance.gte(amount))
      const tx = await token.approve(yveCrvZap.address, MaxUint256);
      await tx.wait();
    }
  };

  const deposit = async () => {
    if (
      !instabrine ||
      !inputToken ||
      !decimals ||
      !erc20 ||
      !address ||
      !masterchef
    )
      return;

    const amount = parseUnits(rawAmount, decimals);

    if (inputToken === "DAI") {
      // go into pDAI
      const tx = await instabrine.primitiveToPickleJar(
        TOKEN.DAI,
        amount,
        PICKLE_JARS.pDAI,
      );
      await tx.wait();

      // go into pDAI farm
      const pDAI = erc20.attach(PICKLE_JARS.pDAI);
      const pTokenAmount = await pDAI.balanceOf(address);
      const allowance = await pDAI.allowance(address, masterchef.address);

      if (!allowance.gte(amount)) {
        const tx = await pDAI.approve(masterchef.address, MaxUint256);
        await tx.wait();
      }

      const tx2 = await masterchef.deposit(BigNumber.from(16), pTokenAmount, {
        gasLimit: 200000,
      });
      await tx2.wait();
    }

    if (inputToken === "USDC" || inputToken === "USDT") {
      // go into p3pool
      const tx = await instabrine.primitiveToCurvePickleJar_3(
        CURVE_POOLS["3pool"],
        [TOKEN.DAI, TOKEN.USDC, TOKEN.USDT],
        [
          ethers.constants.Zero,
          inputToken === "USDC" ? amount : Zero,
          inputToken === "USDT" ? amount : Zero,
        ],
        CURVE_LP["3pool"],
        PICKLE_JARS.p3CRV,
      );
      await tx.wait();

      // go into p3CRV farm
      const p3CRV = erc20.attach(PICKLE_JARS.p3CRV);
      const pTokenAmount = await p3CRV.balanceOf(address);
      const allowance = await p3CRV.allowance(address, masterchef.address);

      if (!allowance.gte(amount)) {
        const tx = await p3CRV.approve(masterchef.address, MaxUint256);
        await tx.wait();
      }

      const tx2 = await masterchef.deposit(BigNumber.from(14), pTokenAmount, {
        gasLimit: 200000,
      });
      await tx2.wait();
    }

    if (inputToken === "renBTC" || inputToken === "wBTC") {
      // go into prenBTC
      const tx = await instabrine.primitiveToCurvePickleJar_2(
        CURVE_POOLS.ren,
        [TOKEN.renBTC, TOKEN.wBTC],
        [
          inputToken === "renBTC" ? amount : Zero,
          inputToken === "wBTC" ? amount : Zero,
        ],
        CURVE_LP.ren,
        PICKLE_JARS.prenBTCWBTC,
      );
      await tx.wait();

      // go into prenCRV farm
      const prenCRV = erc20.attach(PICKLE_JARS.prenBTCWBTC);
      const pTokenAmount = await prenCRV.balanceOf(address);
      const allowance = await prenCRV.allowance(address, masterchef.address);

      if (!allowance.gte(amount)) {
        const tx = await prenCRV.approve(masterchef.address, MaxUint256);
        await tx.wait();
      }

      const tx2 = await masterchef.deposit(BigNumber.from(13), pTokenAmount, {
        gasLimit: 200000,
      });
      await tx2.wait();
    }
    
    if (inputToken === "CRV") {
      // go into pYvecrv
      const tx = await yveCrvZap.zapInCRV(
        amount,
        {gasLimit: 900000}
      );
      await tx.wait();

      // go into pYvecrv farm
      const pYvecrv = erc20.attach(PICKLE_JARS.pSUSHIETHYVECRV);
      const pTokenAmount = await pYvecrv.balanceOf(address);
      const allowance = await pYvecrv.allowance(address, masterchef.address);

      if (!allowance.gte(amount)) {
        const tx = await pYvecrv.approve(masterchef.address, MaxUint256);
        await tx.wait();
      }

      const tx2 = await masterchef.deposit(BigNumber.from(26), pTokenAmount, {
        gasLimit: 200000,
      });
      await tx2.wait();
    }

  };
  return { approve, deposit };
};


export const useDepositEth = (
  rawAmount: string
) => {
  const { address } = Connection.useContainer();
  const { erc20, masterchef, yveCrvZap } = Contracts.useContainer();

  const depositEth = async () => {
    if (
      !address ||
      !masterchef ||
      !yveCrvZap
    ) return;

    const amount = parseUnits(rawAmount, 18);
    console.log(yveCrvZap);
    const overrideOptions = {
      value: amount,
      gasLimit: 900000
    };
    const tx = await yveCrvZap.zapInETH(overrideOptions);
    await tx.wait();

    // go into pYvecrv farm
    const pYvecrv = erc20.attach(PICKLE_JARS.pSUSHIETHYVECRV);
    const pTokenAmount = await pYvecrv.balanceOf(address);
    const allowance = await pYvecrv.allowance(address, masterchef.address);

    if (!allowance.gte(amount)) {
      const tx = await pYvecrv.approve(masterchef.address, MaxUint256);
      await tx.wait();
    }

    const tx2 = await masterchef.deposit(BigNumber.from(26), pTokenAmount, {
      gasLimit: 200000,
    });
    await tx2.wait();
  }
  return { depositEth };
};
