import { BigNumber, ethers } from "ethers";
import { Contract as MulticallContract } from "ethers-multicall";
import styled from "styled-components";
import { useState, FC, useEffect, ReactNode } from "react";
import { Button, Link, Input, Grid, Spacer, Tooltip } from "@geist-ui/react";
import ReactHtmlParser from "react-html-parser";
import { useTranslation } from "next-i18next";
import { Connection } from "../../containers/Connection";
import { formatEther, parseEther } from "ethers/lib/utils";
import { Contracts } from "../../containers/Contracts";
import { ERC20Transfer } from "../../containers/Erc20Transfer";
import Collapse from "../Collapsible/Collapse";
import { UserJarData } from "../../containers/UserJars";
import { LpIcon, TokenIcon, MiniIcon } from "../../components/TokenIcon";
import { UserFarmDataMatic } from "../../containers/UserMiniFarms";
import { getFormatString } from "../Gauges/GaugeInfo";
import { JarApy } from "containers/Jars/useCurveCrvAPY";
import { NETWORK_NAMES } from "containers/config";
import {
  isJarWithdrawOnly,
  isQlpQiMaticOrUsdcToken,
  isQlpQiToken,
} from "containers/Jars/jars";
import { useButtonStatus, ButtonStatus } from "hooks/useButtonStatus";
import { PickleCore } from "../../containers/Jars/usePickleCore";
import { isBalancerPool } from "containers/Jars/jars";
import jarTimelockABI from "../../containers/ABIs/jar_timelock.json";
import { BalancerJarTimer, BalancerJarTimerProps } from "./BalancerJarTimer";
import { JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";

interface DataProps {
  isZero?: boolean;
}

interface FarmDataWithAPY extends UserFarmDataMatic {
  APYs: JarApy[];
  totalAPY: number;
  tooltipText: string;
}

const formatNumber = (num: number) => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: num < 1 ? 6 : 4,
  });
};

const Data = styled.div<DataProps>`
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${(props) => (props.isZero ? "#444" : "unset")};
`;

const Label = styled.div`
  font-family: "Source Sans Pro";
`;

const JarName = styled(Grid)({
  display: "flex",
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const FARM_LP_TO_ICON: {
  [key: string]: string | ReactNode;
} = {
  // Polygon,
  "0x9eD7e3590F2fB9EEE382dfC55c71F9d3DF12556c": (
    <LpIcon swapIconSrc={"/comethswap.png"} tokenIconSrc={"/usdc.png"} />
  ),
  "0x7512105DBb4C0E0432844070a45B7EA0D83a23fD": (
    <LpIcon swapIconSrc={"/comethswap.png"} tokenIconSrc={"/pickle.png"} />
  ),
  "0x91bcc0BBC2ecA760e3b8A79903CbA53483A7012C": (
    <LpIcon swapIconSrc={"/comethswap.png"} tokenIconSrc={"/matic.png"} />
  ),
  "0x0519848e57Ba0469AA5275283ec0712c91e20D8E": "/dai.png",
  "0x261b5619d85B710f1c2570b65ee945975E2cC221": "/3crv.png",
  "0x80aB65b1525816Ffe4222607EDa73F86D211AC95": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/usdt.png"} />
  ),
  "0xd438Ba7217240a378238AcE3f44EFaaaF8aaC75A": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/matic.png"} />
  ),
  "0x74dC9cdCa9a96Fd0B7900e6eb953d1EA8567c3Ce": (
    <LpIcon swapIconSrc={"/quickswap.png"} tokenIconSrc={"mimatic.png"} />
  ),
  "0xd06a56c864C80e4cC76A2eF778183104BF0c848d": (
    <LpIcon swapIconSrc={"/quickswap.png"} tokenIconSrc={"mimatic.png"} />
  ),
  "0xE484Ed97E19F6B649E78db0F37D173C392F7A1D9": (
    <LpIcon swapIconSrc={"/ironswap.png"} tokenIconSrc={"/3usd.png"} />
  ),
  "0xC8450922d18793AD97C401D65BaE8A83aE5353a8": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/dino.jpeg"} />
  ),
  "0x1cCDB8152Bb12aa34e5E7F6C9c7870cd6C45E37F": (
    <LpIcon swapIconSrc={"/quickswap.png"} tokenIconSrc={"/dino.jpeg"} />
  ),
  "0xe5BD4954Bd6749a8E939043eEDCe4C62b41CC6D0": (
    <LpIcon swapIconSrc={"/quickswap.png"} tokenIconSrc={"/qi.png"} />
  ),
  "0x1D35e4348826857eaFb22739d4e494C0337cb427": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/pickle.png"} />
  ),
  "0xD170F0a8629a6F7A1E330D5fC455d96E54c09675": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/work.png"} />
  ),
  "0x6f8B4D9c4dC3592962C55207Ac945dbf5be54cC4": (
    <LpIcon swapIconSrc={"/aurum.png"} tokenIconSrc={"/matic.png"} />
  ),
  "0xCA12121E55C5523ad5e0e6a9062689c4eBa0b691": (
    <LpIcon swapIconSrc={"/raider.png"} tokenIconSrc={"/matic.png"} />
  ),
  "0x2e57627ACf6c1812F99e274d0ac61B786c19E74f": (
    <LpIcon swapIconSrc={"/raider.png"} tokenIconSrc={"/weth.png"} />
  ),
  "0x5E5D7739ea3B6787587E129E4A508FfDAF180923": (
    <LpIcon swapIconSrc={"/aurum.png"} tokenIconSrc={"/usdc.png"} />
  ),

  //Arbitrum
  "0x94fEadE0D3D832E4A05d459eBeA9350c6cDd3bCa": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/mim.webp"} />
  ),
  "0x9Cae10143d7316dF417413C43b79Fb5b44Fa85e2": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/spell.webp"} />
  ),
  "0x973B669eF8c1459f7cb685bf7D7bCD4150977504": (
    <LpIcon swapIconSrc={"/mim.webp"} tokenIconSrc={"/curve.png"} />
  ),
  "0x8E93d85AFa9E6A092676912c3EB00f46C533a07C": (
    <LpIcon swapIconSrc={"/curve.png"} tokenIconSrc={"/tricrypto.png"} />
  ),
  "0x4d622C1f40A83C6FA2c0E441AE393e6dE61E7dD2": (
    <LpIcon swapIconSrc={"/dodo.png"} tokenIconSrc={"/hundred.jpg"} />
  ),
  "0x0A9eD9B39613850819a5f80857395bFeA434c22A": (
    <LpIcon swapIconSrc={"/dodo.png"} tokenIconSrc={"/usdc.png"} />
  ),
  "0x0be790c83648c28eD285fee5E0BD79D1d57AAe69": (
    <LpIcon swapIconSrc={"/balancer.png"} tokenIconSrc={"/bal-tricrypto.png"} />
  ),
  "0x6779EB2838f44300CB6025d17DEB9F2E27CC9540": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/gohm.png"} />
  ),
  "0xEcAf3149fdA215E46e792C65dc0aB7399C2eA78B": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/magic.png"} />
  ),

  // Aurora
  "0xbD59171dA1c3a2624D60421bcb6c3c3270111656": (
    <LpIcon swapIconSrc={"/trisolaris.png"} tokenIconSrc={"/nearusdc.png"} />
  ),
  "0xF623c32828B40c89D5cf114A7186c6B8b25De4Ed": (
    <LpIcon swapIconSrc={"/trisolaris.png"} tokenIconSrc={"/neareth.png"} />
  ),
  "0xF49803dB604E118f3aFCF44beB0012f3c6684F05": (
    <LpIcon swapIconSrc={"/trisolaris.png"} tokenIconSrc={"/nearwbtc.png"} />
  ),
  "0xfc258cF7f1bf3739A04992D1c790aF20d60f44E9": (
    <LpIcon swapIconSrc={"/trisolaris.png"} tokenIconSrc={"/nearusdt.png"} />
  ),
  "0x1E686d65031Ac75754Cd6AeAb5B71ac2257c6a9D": (
    <LpIcon swapIconSrc={"/trisolaris.png"} tokenIconSrc={"/near.png"} />
  ),
  "0x023d4874f30292b24512b969dC8dc8A3227d2012": (
    <LpIcon swapIconSrc={"/trisolaris.png"} tokenIconSrc={"/usdcusdt.png"} />
  ),
  "0x6494DcFa6Af36cE89A990Ca13911365f006898ae": (
    <LpIcon swapIconSrc={"/trisolaris.png"} tokenIconSrc={"/auroratri.png"} />
  ),
  "0x4add83C7a0aEd64468A149dA583f1b92d1aCa6AA": (
    <LpIcon swapIconSrc={"/trisolaris.png"} tokenIconSrc={"/auroraeth.png"} />
  ),
  "0x4550B283D30F96a8B56Fe16EB576f6d5033adDF7": (
    <LpIcon swapIconSrc={"/wanna.png"} tokenIconSrc={"/near.png"} />
  ),
  "0xECDA075c31c20449f89Dc4467CF70d5F98e657D2": (
    <LpIcon swapIconSrc={"/wanna.png"} tokenIconSrc={"/usdt.png"} />
  ),
  "0x6791325D64318BbCe35392da6BdFf94840c4A4B5": (
    <LpIcon swapIconSrc={"/wanna.png"} tokenIconSrc={"/usdc.png"} />
  ),
  "0xB87C8a9c77e3C98AdcA0E24Dce5D9F43E2b698BB": (
    <LpIcon swapIconSrc={"/wanna.png"} tokenIconSrc={"/auroranear.png"} />
  ),
  "0x7b659258a57A5F4DB9C4049d01B6D8AaF6400a25": (
    <LpIcon swapIconSrc={"/wanna.png"} tokenIconSrc={"/nearusdt.png"} />
  ),
  "0x6379F3801cC2004C6CeaD7d766f5d4279E178953": (
    <LpIcon swapIconSrc={"/wanna.png"} tokenIconSrc={"/nearusdc.png"} />
  ),
  "0x4DdaC2BfF3746aDAC32E355f1855FD67Cc6FAa2B": (
    <LpIcon swapIconSrc={"/wanna.png"} tokenIconSrc={"/nearwbtc.png"} />
  ),
  "0x90e28D422AeaC1011e03713125Fb9Ba6b4276fc8": (
    <LpIcon swapIconSrc={"/wanna.png"} tokenIconSrc={"/neardai.png"} />
  ),
  "0x639a02651557fFC1C7F233334248c4E7D416D60B": (
    <LpIcon swapIconSrc={"/wanna.png"} tokenIconSrc={"/neareth.png"} />
  ),
  "0xCb7f715c4CaB533b245c070b58628b4d6a4019E0": (
    <LpIcon swapIconSrc={"/wanna.png"} tokenIconSrc={"/ethbtc.png"} />
  ),
  "0xC6c7481d7e030aC3acbFD53f98797E32824A7B70": (
    <LpIcon swapIconSrc={"/wanna.png"} tokenIconSrc={"/usdcusdt.png"} />
  ),
  "0x4D2FE5BcC9d3d252383D32E1ffF3B3C279eB4E85": (
    <LpIcon swapIconSrc={"/nearpad.png"} tokenIconSrc={"/usdc.png"} />
  ),
  "0x86950b9668804154BD385AE0E228099c4375fEEA": (
    <LpIcon swapIconSrc={"/nearpad.png"} tokenIconSrc={"/usdt.png"} />
  ),
  "0xcf59208abbAE8457F39f961eAb6293bdef1E5F1e": (
    <LpIcon swapIconSrc={"/nearpad.png"} tokenIconSrc={"/nearwbtc.png"} />
  ),
  "0x4F83d6ae3401f6859B579D840a5E38862a889282": (
    <LpIcon swapIconSrc={"/nearpad.png"} tokenIconSrc={"/weth.png"} />
  ),
  "0x6401Ded5D808eE824791dBfc23aA8769b585EB37": (
    <LpIcon swapIconSrc={"/nearpad.png"} tokenIconSrc={"/near.png"} />
  ),
  "0xc773eF9aE52fF43031DD2Db439966ef4cb55bd79": (
    <LpIcon swapIconSrc={"/nearpad.png"} tokenIconSrc={"/frax.webp"} />
  ),
  // nearJar 5a Auroraswap AURORA/NEAR
  "0xE0df9e3a0595989D6Ada23AF1C0df876e8742941": (
    <LpIcon swapIconSrc={"/auroraswap.png"} tokenIconSrc={"/auroranear.png"} />
  ),
  // nearJar 5b Auroraswap AVAX/NEAR
  "0xf4A06eBe93847f2D822fAc255eB01416545709C6": (
    <LpIcon swapIconSrc={"/auroraswap.png"} tokenIconSrc={"/avax.png"} />
  ),
  // nearJar 5d Auroraswap BRL/AURORA
  "0xEc84AF3108c76bFBbf9652A2F39F7dC7005D70a4": (
    <LpIcon swapIconSrc={"/auroraswap.png"} tokenIconSrc={"/aurora.png"} />
  ),
  // nearJar 5e Auroraswap BRL/ETH
  "0x25a7f48587DD37eD194d1e6DCF3b2DDC48D83cAf": (
    <LpIcon swapIconSrc={"/auroraswap.png"} tokenIconSrc={"/ethereum.png"} />
  ),
  // nearJar 5f AuroraSwap BRL/NEAR
  "0x3d1E5f81101de37463775a5Be13C2eEe066a0D63": (
    <LpIcon swapIconSrc={"/auroraswap.png"} tokenIconSrc={"/near.png"} />
  ),
  // nearJar 5g AuroraSwap BUSD/NEAR
  "0x544c6bab8Fd668B6888D9a1c0bb1BE0c9009fce0": (
    <LpIcon swapIconSrc={"/auroraswap.png"} tokenIconSrc={"/busd.png"} />
  ),
  // nearJar 5h AuroraSwap ETH/BTC
  "0x6bcd59972Af5b6C27e7Df3FA49787B5Fb578E083": (
    <LpIcon swapIconSrc={"/auroraswap.png"} tokenIconSrc={"/ethbtc.png"} />
  ),
  // nearJar 5i AuroraSwap MATIC/NEAR
  "0x506f103Dbef428426A8ABD31B3F7c7AbfeB5F681": (
    <LpIcon swapIconSrc={"/auroraswap.png"} tokenIconSrc={"/matic.png"} />
  ),
  // nearJar 5j AuroraSwap NEAR/BTC
  "0xA80751447B89dE8601bacB876Ff0096E2FF77c71": (
    <LpIcon swapIconSrc={"/auroraswap.png"} tokenIconSrc={"/nearwbtc.png"} />
  ),
  // nearJar 5k AuroraSwap NEAR/ETH
  "0x8Bc0684beF765B1b0dAf266A82c9f26699Ee0d2A": (
    <LpIcon swapIconSrc={"/auroraswap.png"} tokenIconSrc={"/neareth.png"} />
  ),
  // nearJar 5l AuroraSwap NEAR/LUNA
  "0x5583D1E47884ba3bbe7E66B564782151114f5ddE": (
    <LpIcon swapIconSrc={"/auroraswap.png"} tokenIconSrc={"/luna.webp"} />
  ),
  // nearJar 5m AuroraSwap NEAR/USDC
  "0xcd71713171fe53Fc1D9EF4C034052669Eb978c20": (
    <LpIcon swapIconSrc={"/auroraswap.png"} tokenIconSrc={"/nearusdc.png"} />
  ),
  // nearJar 5n AuroraSwap NEAR/USDT
  "0xD06Bfe30e9AD42Bb92bab8930300BBE98BBe12B7": (
    <LpIcon swapIconSrc={"/auroraswap.png"} tokenIconSrc={"/nearusdt.png"} />
  ),
  // nearJar 5o AuroraSwap USDT/USDC
  "0x4F5bd36925e1a141Ebb34f94Be00bdc4A3fc7034": (
    <LpIcon swapIconSrc={"/auroraswap.png"} tokenIconSrc={"/usdcusdt.png"} />
  ),
  // nearJar 5p AuroaSwap UST/NEAR
  "0xD701e3E627f30458ee24dBeeDf11BDAA20B96dAe": (
    <LpIcon swapIconSrc={"/auroraswap.png"} tokenIconSrc={"/ust.png"} />
  ),
  // trisolaris TRI-USDT
  "0x820980948220115Ccc64C66Ef71E65c2b7239664": (
    <LpIcon swapIconSrc={"/trisolaris.png"} tokenIconSrc={"/usdt.png"} />
  ),
  // trisolaris NEAR-LUNA
  "0x59384A541cEF5f604d39C5AaF0CD98170EEb15D2": (
    <LpIcon swapIconSrc={"/trisolaris.png"} tokenIconSrc={"/luna.webp"} />
  ),
  // trisolaris UST-NEAR
  "0xC7201D4BA106F524AafBB93aBeac648016E17A06": (
    <LpIcon swapIconSrc={"/trisolaris.png"} tokenIconSrc={"/ust.png"} />
  ),
  // wannaswap WANNA-AURORA
  "0xf3EbeC4D691Bc5Ea7B0158228feCfC3de2aE3910": (
    <LpIcon swapIconSrc={"/wanna.png"} tokenIconSrc={"/wanna.png"} />
  ),
};

export const JarMiniFarmCollapsible: FC<{
  jarData: UserJarData;
  farmData: FarmDataWithAPY;
}> = ({ jarData, farmData }) => {
  // Jar info
  const {
    name,
    jarContract,
    depositToken,
    ratio,
    depositTokenName,
    balance,
    deposited,
    usdPerPToken,
    depositTokenLink,
    apr,
    tvlUSD,
  } = jarData;

  const balNum = parseFloat(formatEther(balance));
  const depositedNum = parseFloat(formatEther(deposited));

  const balStr = formatNumber(balNum);

  const depositedStr = formatNumber(depositedNum);
  const underlyingStr = (num: BigNumber): string => {
    return formatNumber(parseFloat(formatEther(num)) * ratio);
  };

  const depositedUnderlyingStr = underlyingStr(deposited);

  // Farm info
  const {
    depositToken: farmDepositToken,
    balance: farmBalance,
    staked,
    harvestable,
    harvestableMatic,
    depositTokenName: farmDepositTokenName,
    poolIndex,
    tooltipText,
    totalAPY,
  } = farmData;
  const stakedUnderlyingStr = underlyingStr(staked);

  const stakedNum = parseFloat(formatEther(staked));
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isExitBatch, setIsExitBatch] = useState<Boolean>(false);
  const [isEntryBatch, setIsEntryBatch] = useState<Boolean>(false);
  const { t } = useTranslation("common");
  const { setButtonStatus } = useButtonStatus();

  const [depositButton, setDepositButton] = useState<ButtonStatus>({
    disabled: false,
    text: t("farms.deposit"),
  });
  const [withdrawButton, setWithdrawButton] = useState<ButtonStatus>({
    disabled: false,
    text: t("farms.withdraw"),
  });

  const {
    status: erc20TransferStatuses,
    transfer,
    getTransferStatus,
  } = ERC20Transfer.useContainer();
  const {
    signer,
    address,
    blockNum,
    chainName,
    multicallProvider,
  } = Connection.useContainer();
  const { minichef, jar } = Contracts.useContainer();
  const { pickleCore } = PickleCore.useContainer();

  const stakedStr = formatNumber(stakedNum);

  const harvestableStr = formatNumber(
    parseFloat(formatEther(harvestable || 0)),
  );

  const harvestableMaticStr = parseFloat(
    formatEther(harvestableMatic || 0),
  ).toLocaleString();

  const balanceNum = parseFloat(formatEther(balance));

  const balanceStr = formatNumber(balanceNum);

  const [unstakeAmount, setUnstakeAmount] = useState("");

  const [stakeButton, setStakeButton] = useState<ButtonStatus>({
    disabled: false,
    text: t("farms.stakeUnstaked", { amount: depositedStr }),
  });
  const [unstakeButton, setUnstakeButton] = useState<ButtonStatus>({
    disabled: false,
    text: t("farms.unstake"),
  });
  const [harvestButton, setHarvestButton] = useState<ButtonStatus>({
    disabled: false,
    text: t("farms.harvest"),
  });

  const [depositStakeButton, setDepositStakeButton] = useState<string | null>(
    null,
  );
  const [exitButton, setExitButton] = useState<string | null>(null);

  const isMaiJar = isQlpQiMaticOrUsdcToken(depositToken.address);

  const isQiMaiJar = isQlpQiToken(depositToken.address);
  const foundJar: JarDefinition | undefined = pickleCore?.assets.jars.find(
    (x) =>
      x.depositToken.addr.toLowerCase() === depositToken.address.toLowerCase(),
  );
  const isClosingOnly = foundJar
    ? isJarWithdrawOnly(foundJar.details.apiKey, pickleCore)
    : false;

  const isBalancerJar = isBalancerPool(depositToken.address);

  const depositAndStake = async () => {
    if (balNum && minichef && address) {
      try {
        setIsEntryBatch(true);
        const res = await transfer({
          token: depositToken.address,
          recipient: jarContract.address,
          approvalAmountRequired: parseEther(depositAmount),
          transferCallback: async () => {
            return jarContract
              .connect(signer)
              .deposit(parseEther(depositAmount));
          },
        });
        if (!res) throw "Deposit Failed";
        const Token = jar?.attach(farmDepositToken.address).connect(signer);
        if (!approved) {
          setDepositStakeButton(t("farms.approving"));
          const tx = await Token.approve(
            minichef.address,
            ethers.constants.MaxUint256,
          );
          await tx.wait();
        }
        const realRatio = await Token.getRatio();
        setDepositStakeButton(t("farms.staking"));
        const newBalance = getStakeableBalance(realRatio);
        const farmTx = await minichef.deposit(poolIndex, newBalance, address);
        await farmTx.wait();
        await sleep(10000);
        setDepositStakeButton(null);
        setIsEntryBatch(false);
      } catch (error) {
        console.error(error);
        setDepositStakeButton(null);
        setIsEntryBatch(false);
        return;
      }
    }
  };

  // Necessary because querying pToken balance intros a race condition
  const getStakeableBalance = (realRatio: ethers.BigNumber) =>
    parseEther(depositAmount)
      .mul(ethers.utils.parseUnits("1", 18))
      .div(realRatio)
      .add(deposited)
      .sub("1");

  const exit = async () => {
    if (stakedNum && minichef && address) {
      try {
        setIsExitBatch(true);
        setExitButton(t("farms.unstakingFromFarm"));
        const exitTx = await minichef.withdrawAndHarvest(
          poolIndex,
          staked,
          address,
        );
        await exitTx.wait();
        setExitButton(t("farms.withdrawingFromJar"));
        const withdrawTx = await jarContract.connect(signer).withdrawAll();
        await withdrawTx.wait();
        await sleep(10000);
        setExitButton(null);
        setIsExitBatch(false);
      } catch (error) {
        console.error(error);
        setExitButton(null);
        setIsExitBatch(false);
        return;
      }
    }
  };

  useEffect(() => {
    if (jarData && !isExitBatch) {
      const dStatus = getTransferStatus(
        depositToken.address,
        jarContract.address,
      );
      const wStatus = getTransferStatus(
        jarContract.address,
        jarContract.address,
      );

      setButtonStatus(
        dStatus,
        t("farms.depositing"),
        t("farms.deposit"),
        setDepositButton,
      );
      setButtonStatus(
        wStatus,
        t("farms.withdrawing"),
        t("farms.withdraw"),
        setWithdrawButton,
      );
    }
    if (minichef && !isExitBatch) {
      const stakeStatus = getTransferStatus(
        farmDepositToken.address,
        minichef.address,
      );
      const unstakeStatus = getTransferStatus(
        minichef.address,
        farmDepositToken.address,
      );
      const harvestStatus = getTransferStatus(minichef.address, "harvest");
      const exitStatus = getTransferStatus(minichef.address, "exit");

      setButtonStatus(
        stakeStatus,
        t("farms.staking"),
        t("farms.stakeUnstaked", { amount: depositedStr }),
        setStakeButton,
      );
      setButtonStatus(
        unstakeStatus,
        t("farms.unstaking"),
        t("farms.unstake"),
        setUnstakeButton,
      );
      setButtonStatus(
        harvestStatus,
        t("farms.harvesting"),
        t("farms.harvest"),
        setHarvestButton,
      );
    }
  }, [erc20TransferStatuses, jarData, depositedStr]);

  const { erc20 } = Contracts.useContainer();
  const [approved, setApproved] = useState(false);

  const isOK = chainName === NETWORK_NAMES.OKEX;
  const isArb = chainName === NETWORK_NAMES.ARB;

  useEffect(() => {
    const checkAllowance = async () => {
      if (erc20 && address && signer && minichef) {
        const Token = erc20.attach(farmDepositToken.address).connect(signer);
        const allowance = await Token.allowance(address, minichef.address);
        if (allowance.gt(ethers.constants.Zero)) {
          setApproved(true);
        }
      }
    };
    checkAllowance();
  }, [blockNum, address, erc20]);

  const tvlJarData = pickleCore?.assets.jars.filter(
    (x) =>
      x.depositToken.addr.toLowerCase() === depositToken.address.toLowerCase(),
  )[0];

  const [
    balancerTimerProps,
    setBalancerTimerProps,
  ] = useState<BalancerJarTimerProps | null>(null);

  useEffect(() => {
    const checkCooldown = async () => {
      if (isBalancerJar && signer && multicallProvider) {
        const jarMulticall = new MulticallContract(
          jarContract.address,
          jarTimelockABI,
        );
        const [
          cdStartTimeRes,
          cdTimeRes,
          initialWFRes,
          initialWFMaxRes,
        ] = await multicallProvider.all([
          jarMulticall.cooldownStartTime(address),
          jarMulticall.cooldownTime(),
          jarMulticall.initialWithdrawalFee(),
          jarMulticall.initialWithdrawalFeeMax(),
        ]);
        const cdStartTime = parseFloat(
          ethers.utils.formatUnits(cdStartTimeRes, 0),
        );
        const cdTime = parseFloat(ethers.utils.formatUnits(cdTimeRes, 0));
        const initialWF = parseFloat(ethers.utils.formatUnits(initialWFRes, 0));
        const initialWFMax = parseFloat(
          ethers.utils.formatUnits(initialWFMaxRes, 0),
        );
        const endTime = cdStartTime + cdTime;
        const timerProps: BalancerJarTimerProps = {
          endTime: endTime,
          timeLockLength: cdTime,
          initialExitFee: initialWF,
          initialExitFeeMax: initialWFMax,
        };
        setBalancerTimerProps(timerProps);
      }
    };
    checkCooldown();
  }, [blockNum]);

  const tvlNum =
    tvlJarData && tvlJarData.details.harvestStats
      ? tvlJarData.details.harvestStats.balanceUSD
      : tvlUSD;

  const tvlStr = getFormatString(tvlNum);

  const toLocaleNdigits = (val: number, digits: number) => {
    return val.toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  };

  const valueStr = toLocaleNdigits(
    usdPerPToken * (depositedNum + stakedNum),
    2,
  );
  let valueStrExplained = undefined;
  let userSharePendingStr = undefined;
  if (usdPerPToken * (depositedNum + stakedNum) !== 0) {
    valueStrExplained = t("farms.ratio") + ": " + toLocaleNdigits(ratio, 4);
    const jarAddress = jarContract.address;
    const jar = pickleCore?.assets.jars.find(
      (x) => x.contract.toLowerCase() === jarAddress.toLowerCase(),
    );
    if (jar) {
      const totalPtokens = jar.details.tokenBalance;
      if (totalPtokens) {
        const userShare = (depositedNum + stakedNum) / totalPtokens;
        const pendingHarvest = jar.details.harvestStats?.harvestableUSD;
        if (pendingHarvest) {
          const userShareHarvestUsd = userShare * pendingHarvest * 0.8;
          userSharePendingStr =
            t("farms.pending") +
            ": $" +
            toLocaleNdigits(userShareHarvestUsd, 2);
        }
      }
    }
  }

  return (
    <Collapse
      style={{ borderWidth: "1px", boxShadow: "none" }}
      shadow
      preview={
        <Grid.Container gap={1}>
          <JarName xs={24} sm={12} md={6} lg={6}>
            <TokenIcon
              src={
                FARM_LP_TO_ICON[
                  farmDepositToken.address as keyof typeof FARM_LP_TO_ICON
                ]
              }
            />
            <div style={{ width: "100%" }}>
              <div style={{ fontSize: `1rem` }}>{name}</div>
              <a
                href={depositTokenLink}
                target="_"
                style={{ fontSize: `1rem` }}
              >
                {depositTokenName}
              </a>
            </div>
          </JarName>
          <Grid xs={24} sm={12} md={3} lg={3} style={{ textAlign: "center" }}>
            <Data isZero={balanceNum === 0}>{balanceStr}</Data>
            <br />
            <Label>{t("balances.walletBalance")}</Label>
          </Grid>
          <Grid xs={24} sm={12} md={4} lg={4} css={{ textAlign: "center" }}>
            <Data
              isZero={
                +formatEther(harvestableMatic) === 0 &&
                +formatEther(harvestable) === 0
              }
            >
              {harvestableStr} <MiniIcon source={"/pickle.png"} />
              <Spacer y={1} />
              {/* {!isArb && (
                <>
                  {harvestableMaticStr}{" "}
                  <MiniIcon source={isOK ? "/okex.png" : "/matic.png"} />
                </>
              )} */}
            </Data>
            <Label>{t("balances.earned")}</Label>
          </Grid>
          <Grid xs={24} sm={12} md={3} lg={3} style={{ textAlign: "center" }}>
            <>
              <Data isZero={+valueStr == 0}>${valueStr}</Data>
              <Label>{t("balances.depositValue")}</Label>
              {Boolean(valueStrExplained !== undefined) && (
                <Label>{valueStrExplained}</Label>
              )}
              {Boolean(userSharePendingStr !== undefined) && (
                <Label>{userSharePendingStr}</Label>
              )}
            </>
          </Grid>
          <Grid xs={24} sm={24} md={4} lg={4} style={{ textAlign: "center" }}>
            <Data>
              <Tooltip text={ReactHtmlParser(tooltipText)}>
                {totalAPY.toFixed(2) + "%" || "--"}
              </Tooltip>
              <img
                src="./question.svg"
                width="15px"
                style={{ marginLeft: 5 }}
              />
              <Spacer y={1} />
              <div>
                <span>{t("balances.apy")}</span>
              </div>
            </Data>
          </Grid>
          <Grid xs={24} sm={12} md={4} lg={4} style={{ textAlign: "center" }}>
            <Data isZero={tvlNum === 0}>${tvlStr}</Data>
            <br />
            <Label>{t("balances.tvl")}</Label>
          </Grid>
        </Grid.Container>
      }
    >
      <Spacer y={1} />
      <Grid.Container gap={2}>
        <Grid
          xs={24}
          md={depositedNum && (!isEntryBatch || stakedNum) ? 12 : 24}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              {t("balances.balance")}: {balStr} {depositTokenName}
            </div>
            <Link
              color
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setDepositAmount(formatEther(balance));
              }}
            >
              {t("balances.max")}
            </Link>
          </div>
          <Input
            onChange={(e) => setDepositAmount(e.target.value)}
            value={depositAmount}
            width="100%"
          ></Input>
          <Spacer y={0.5} />
          <Grid.Container gap={1}>
            <Grid xs={24} md={12}>
              <Button
                onClick={() => {
                  if (signer) {
                    // Allow Jar to get LP Token
                    transfer({
                      token: depositToken.address,
                      recipient: jarContract.address,
                      approvalAmountRequired: parseEther(depositAmount),
                      transferCallback: async () => {
                        return jarContract
                          .connect(signer)
                          .deposit(parseEther(depositAmount));
                      },
                    });
                  }
                }}
                disabled={depositButton.disabled || isClosingOnly || isQiMaiJar}
                style={{ width: "100%" }}
              >
                {depositButton.text}
              </Button>
              {isMaiJar ? (
                <StyledNotice>{t("farms.mai.description")}</StyledNotice>
              ) : isQiMaiJar ? (
                <StyledNotice>{t("farms.mai.rewardsEnded")}</StyledNotice>
              ) : null}
              {isClosingOnly ? (
                <StyledNotice>{t("farms.closingOnly")}</StyledNotice>
              ) : null}
            </Grid>
            <Grid xs={24} md={12}>
              <Button
                onClick={depositAndStake}
                disabled={
                  Boolean(depositStakeButton) ||
                  depositButton.disabled ||
                  isQiMaiJar ||
                  isClosingOnly
                }
                style={{ width: "100%" }}
              >
                {isEntryBatch
                  ? depositStakeButton || depositButton.text
                  : t("farms.depositAndStake")}
              </Button>
            </Grid>
          </Grid.Container>
          <Spacer y={1} />
          {isBalancerJar ? t("farms.balancer.info") : null}
        </Grid>
        {depositedNum !== 0 && (!isEntryBatch || stakedNum) && (
          <Grid xs={24} md={12}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                {t("balances.balance")}: {depositedStr} (
                <Tooltip
                  text={`${
                    deposited && ratio
                      ? parseFloat(formatEther(deposited)) * ratio
                      : 0
                  } ${depositTokenName}`}
                >
                  {depositedUnderlyingStr}
                </Tooltip>{" "}
                {depositTokenName}){" "}
              </div>
              <Link
                color
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setWithdrawAmount(formatEther(deposited));
                }}
              >
                {t("balances.max")}
              </Link>
            </div>
            <Input
              onChange={(e) => setWithdrawAmount(e.target.value)}
              value={withdrawAmount}
              width="100%"
            ></Input>
            <Spacer y={0.5} />
            <Button
              disabled={withdrawButton.disabled}
              onClick={() => {
                if (signer) {
                  // Allow pToken to burn its pToken
                  // and refund lpToken
                  transfer({
                    token: jarContract.address,
                    recipient: jarContract.address,
                    transferCallback: async () => {
                      return jarContract
                        .connect(signer)
                        .withdraw(parseEther(withdrawAmount));
                    },
                    approval: false,
                  });
                }
              }}
              style={{ width: "100%" }}
            >
              {withdrawButton.text}
            </Button>
            {isBalancerJar && balancerTimerProps ? (
              <BalancerJarTimer {...balancerTimerProps} />
            ) : null}
          </Grid>
        )}
      </Grid.Container>
      <Spacer y={1} />
      {Boolean(depositedNum || stakedNum) && (
        <Grid.Container gap={2}>
          {depositedNum && !isExitBatch && !isEntryBatch && (
            <Grid
              xs={24}
              md={(depositedNum && !stakedNum) || isEntryBatch ? 24 : 12}
            >
              <Spacer y={1.2} />
              <Button
                disabled={stakeButton.disabled}
                onClick={() => {
                  if (minichef && address) {
                    transfer({
                      token: farmDepositToken.address,
                      recipient: minichef.address,
                      approvalAmountRequired: farmBalance,
                      transferCallback: async () => {
                        return minichef.deposit(
                          poolIndex,
                          farmBalance,
                          address,
                        );
                      },
                    });
                  }
                }}
                style={{ width: "100%" }}
              >
                {stakeButton.text}
              </Button>
            </Grid>
          )}
          {Boolean(stakedNum) && (
            <Grid
              xs={24}
              md={
                (!depositedNum || isEntryBatch || isExitBatch) && stakedNum
                  ? 24
                  : 12
              }
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  {t("balances.staked")}: {stakedStr} {farmDepositTokenName} (
                  {stakedUnderlyingStr} {depositTokenName}){" "}
                </div>
                <Link
                  color
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setUnstakeAmount(formatEther(staked));
                  }}
                >
                  {t("balances.max")}
                </Link>
              </div>
              <Input
                onChange={(e) => setUnstakeAmount(e.target.value)}
                value={unstakeAmount}
                width="100%"
                type="number"
                size="large"
              />
            </Grid>
          )}
        </Grid.Container>
      )}
      {Boolean(stakedNum) && (
        <>
          <Spacer y={0.5} />
          <Grid.Container gap={2}>
            <Grid xs={24} md={12}>
              <Button
                disabled={harvestButton.disabled}
                onClick={() => {
                  if (minichef && signer && address) {
                    transfer({
                      token: minichef.address,
                      recipient: minichef.address, // Doesn't matter since we don't need approval
                      approval: false,
                      transferCallback: async () => {
                        return minichef.harvest(poolIndex, address);
                      },
                    });
                  }
                }}
                style={{ width: "100%" }}
              >
                {harvestButton.text} {harvestableStr} $PICKLES
              </Button>
            </Grid>
            <Grid xs={24} md={12}>
              <Button
                disabled={unstakeButton.disabled}
                onClick={() => {
                  if (minichef && address) {
                    transfer({
                      token: minichef.address,
                      recipient: farmDepositToken.address,
                      approval: false,
                      transferCallback: async () => {
                        return minichef.withdrawAndHarvest(
                          poolIndex,
                          ethers.utils.parseEther(unstakeAmount),
                          address,
                        );
                      },
                    });
                  }
                }}
                style={{ width: "100%" }}
              >
                {unstakeButton.text}
              </Button>
            </Grid>
          </Grid.Container>
        </>
      )}
      <Spacer y={0.5} />
      <Grid.Container gap={2}>
        {Boolean(stakedNum || isExitBatch) && (
          <>
            <Grid xs={24} md={24}>
              <Button
                disabled={exitButton || isExitBatch}
                onClick={exit}
                style={{ width: "100%" }}
              >
                {exitButton || t("farms.harvestAndExit")}
              </Button>
            </Grid>
          </>
        )}
      </Grid.Container>
    </Collapse>
  );
};

const StyledNotice = styled.div`
  width: "100%";
  textalign: "center";
  paddingtop: "6px";
  fontfamily: "Source Sans Pro";
`;
