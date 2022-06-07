import { BigNumber, ethers } from "ethers";
import styled from "styled-components";
import { Trans, useTranslation } from "next-i18next";

import { useState, FC, useEffect, ReactNode } from "react";
import { Button, Link, Input, Grid, Spacer, Tooltip, Select } from "@geist-ui/react";
import ReactHtmlParser from "react-html-parser";

import { Connection } from "../../containers/Connection";
import { formatEther, formatUnits } from "ethers/lib/utils";
import { Contracts } from "../../containers/Contracts";
import { ERC20Transfer } from "../../containers/Erc20Transfer";
import Collapse from "../Collapsible/Collapse";
import { UserJarData } from "v1/containers/UserJars";
import { LpIcon, TokenIcon, ZapperIcon, MiniIcon } from "../../components/TokenIcon";
import {
  isYveCrvEthJarToken,
  isMainnetMimEthJarDepositToken,
  isJarWithdrawOnly,
  isLooksJar,
} from "../../containers/Jars/jars";
import { useDill } from "../../containers/Dill";
import { useMigrate } from "../Farms/UseMigrate";
import { Gauge__factory as GaugeFactory } from "../../containers/Contracts/factories/Gauge__factory";
import { getFormatString } from "./GaugeInfo";
import { zapDefaultTokens } from "../Zap/tokens";
import { tokenInfo, useBalance } from "../Zap/useBalance";
import { DEFAULT_SLIPPAGE } from "../Zap/constants";
import { useZapIn } from "../Zap/useZapper";
import { uncompoundAPY } from "../../util/jars";
import { JarApy, UserGaugeDataWithAPY } from "./GaugeList";
import { useButtonStatus, ButtonStatus } from "v1/hooks/useButtonStatus";
import { PickleCore } from "../../containers/Jars/usePickleCore";
import { JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";
import {
  getRatioStringAndPendingString,
  RatioAndPendingStrings,
} from "v1/features/MiniFarms/JarMiniFarmCollapsible";
import { gasLimit, JarInteraction } from "v1/util/gasLimits";

interface DataProps {
  isZero?: boolean;
}

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

const formatAPY = (apy: number) => {
  if (apy === Number.POSITIVE_INFINITY) return "∞%";
  const decimalPlaces = Math.log(apy) / Math.log(10) > 4 ? 0 : 2;
  return apy.toFixed(decimalPlaces) + "%";
};

const formatValue = (num: number) =>
  num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: num < 1 ? 6 : 4,
  });

export const JAR_DEPOSIT_TOKEN_TO_ICON: {
  [key: string]: string | ReactNode;
} = {
  "0xC25a3A3b969415c80451098fa907EC722572917F": "/sCRV.png",
  "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11": "/dai.png",
  "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc": "/usdc.png",
  "0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852": "/usdt.png",
  "0x49849C98ae39Fff122806C06791Fa73784FB3675": "/rencrv.png",
  "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490": "/3crv.png",
  "0xBb2b8038a1640196FbE3e38816F3e67Cba72D940": "/btc.png",
  "0x6B175474E89094C44Da98b954EedeAC495271d0F": "/dai.png",
  "0xC3D03e4F041Fd4cD388c549Ee2A29a9E5075882f": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/dai.png"} />
  ),
  "0xd48cf4d7fb0824cc8bae055df3092584d0a1726a": "/saddle.svg",
  "0x397FF1542f962076d0BFE58eA045FfA2d347ACa0": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/usdc.png"} />
  ),
  "0x06da0fd433C1A5d7a4faa01111c044910A184553": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/usdt.png"} />
  ),
  "0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/btc.png"} />
  ),
  "0x088ee5007C98a9677165D78dD2109AE4a3D04d0C": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/yfi.png"} />
  ),
  "0xd4405F0704621DBe9d4dEA60E128E0C3b26bddbD": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/bac.png"} />
  ),
  "0x3E78F2E7daDe07ea685F8612F00477FD97162F1e": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/bas.svg"} />
  ),
  "0x87dA823B6fC8EB8575a235A824690fda94674c88": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/mir.png"} />
  ),
  "0x9928e4046d7c6513326cCeA028cD3e7a91c7590A": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/fei.png"} />
  ),
  "0x5233349957586A8207c52693A959483F9aeAA50C": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/tesla.png"} />
  ),
  "0xB022e08aDc8bA2dE6bA4fECb59C6D502f66e953B": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/apple.png"} />
  ),
  "0x9E3B47B861B451879d43BBA404c35bdFb99F0a6c": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/qqq.png"} />
  ),
  "0x860425bE6ad1345DC7a3e287faCBF32B18bc4fAe": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/slv.png"} />
  ),
  "0x676Ce85f66aDB8D7b8323AeEfe17087A3b8CB363": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/baba.png"} />
  ),
  "0xC9cB53B48A2f3A9e75982685644c1870F1405CCb": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/mic.png"} />
  ),
  "0x066F3A3B7C8Fa077c71B9184d862ed0A4D5cF3e0": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/mis.png"} />
  ),
  "0x06325440D014e39736583c165C2963BA99fAf14E": (
    <LpIcon swapIconSrc={"/curve.png"} tokenIconSrc={"/steth.png"} />
  ),
  "0x10B47177E92Ef9D5C6059055d92DdF6290848991": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/yvecrv.png"} />
  ),
  "0x9461173740D27311b176476FA27e94C681b1Ea6b": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/yvboost.png"} />
  ),
  "0x795065dCc9f64b5614C407a6EFDC400DA6221FB0": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/sushiswap.png"} />
  ),
  "0xF20EF17b889b437C151eB5bA15A47bFc62bfF469": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/lusd.webp"} />
  ),
  "0xC3f279090a47e80990Fe3a9c30d24Cb117EF91a8": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/alchemix.png"} />
  ),
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": (
    <LpIcon swapIconSrc={"/yfi.png"} tokenIconSrc={"/usdc.png"} />
  ),
  "0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA": (
    <LpIcon swapIconSrc={"/yfi.png"} tokenIconSrc={"/lusd.webp"} />
  ),
  "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B": (
    <LpIcon swapIconSrc={"/yfi.png"} tokenIconSrc={"/frax.webp"} />
  ),
  "0x05767d9EF41dC40689678fFca0608878fb3dE906": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/convex.png"} />
  ),
  "0x6DEA81C8171D0bA574754EF6F8b412F2Ed88c54D": "/liquity.png",
  "0x5a6A4D54456819380173272A5E8E9B9904BdF41B": (
    <LpIcon swapIconSrc={"/mim.webp"} tokenIconSrc={"/3crv.png"} />
  ),
  "0xb5De0C3753b6E1B4dBA616Db82767F17513E6d4E": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/spell.webp"} />
  ),
  "0x07D5695a24904CC1B6e3bd57cC7780B90618e3c4": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/mim.webp"} />
  ),
  "0x27fD0857F0EF224097001E87e61026E39e1B04d1": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/rally.jpeg"} />
  ),
  // STAR USDC
  "0xdf0770dF86a8034b3EFEf0A1Bb3c889B8332FF56": (
    <LpIcon swapIconSrc={"/protocols/stargate.png"} tokenIconSrc={"/tokens/usdc.png"} />
  ),
  // STAR USDT
  "0x38EA452219524Bb87e18dE1C24D3bB59510BD783": (
    <LpIcon swapIconSrc={"/protocols/stargate.png"} tokenIconSrc={"/tokens/usdt.png"} />
  ),

  // Polygon Jars

  "0x1Edb2D8f791D2a51D56979bf3A25673D6E783232": (
    <LpIcon swapIconSrc={"/comethswap.png"} tokenIconSrc={"/usdc.png"} />
  ),
  "0xb0b5e3bd18eb1e316bcd0bba876570b3c1779c55": (
    <LpIcon swapIconSrc={"/comethswap.png"} tokenIconSrc={"/pickle.png"} />
  ),
  "0x80676b414a905de269d0ac593322af821b683b92": (
    <LpIcon swapIconSrc={"/comethswap.png"} tokenIconSrc={"/matic.png"} />
  ),
  "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063": "/dai.png",
  "0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171": "/3crv.png",
  "0xc2755915a85c6f6c1c0f3a86ac8c058f11caa9c9": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/usdt.png"} />
  ),
  "0xc4e595acdd7d12fec385e5da5d43160e8a0bac0e": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/matic.png"} />
  ),
  "0x160532d2536175d65c03b97b0630a9802c274dad": (
    <LpIcon swapIconSrc={"/quickswap.png"} tokenIconSrc={"/mimatic.png"} />
  ),
  "0x74dC9cdCa9a96Fd0B7900e6eb953d1EA8567c3Ce": (
    <LpIcon swapIconSrc={"/quickswap.png"} tokenIconSrc={"/mimatic.png"} />
  ),
  "0x7AfcF11F3e2f01e71B7Cc6b8B5e707E42e6Ea397": (
    <LpIcon swapIconSrc={"/quickswap.png"} tokenIconSrc={"/mimatic.png"} />
  ),
  "0xb4d09ff3dA7f9e9A2BA029cb0A81A989fd7B8f17": (
    <LpIcon swapIconSrc={"/ironswap.png"} tokenIconSrc={"/3usd.png"} />
  ),
  "0x470e8de2eBaef52014A47Cb5E6aF86884947F08c": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/fox.png"} />
  ),
  "0x3324af8417844e70b81555A6D1568d78f4D4Bf1f": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/dino.jpeg"} />
  ),
  "0x9f03309A588e33A239Bf49ed8D68b2D45C7A1F11": (
    <LpIcon swapIconSrc={"/quickswap.png"} tokenIconSrc={"/dino.jpeg"} />
  ),
  "0xfCEAAf9792139BF714a694f868A215493461446D": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/truefi.jpeg"} />
  ),
  "0x5282a4ef67d9c33135340fb3289cc1711c13638c": (
    <LpIcon swapIconSrc={"/yfi.png"} tokenIconSrc="/cream.jpeg" />
  ),
  "0x9D0464996170c6B9e75eED71c68B99dDEDf279e8": (
    <LpIcon swapIconSrc={"/curve.png"} tokenIconSrc={"/convex.png"} />
  ),
  "0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7": (
    <LpIcon swapIconSrc={"/convex.png"} tokenIconSrc={"/curve.png"} />
  ),
  "0xEd4064f376cB8d68F770FB1Ff088a3d0F3FF5c4d": (
    <LpIcon swapIconSrc={"/convex.png"} tokenIconSrc={"/crveth.png"} />
  ),
  "0x3A283D9c08E8b55966afb64C515f5143cf907611": (
    <LpIcon swapIconSrc={"/convex.png"} tokenIconSrc={"/weth.png"} />
  ),
  "0xDC00bA87Cc2D99468f7f34BC04CBf72E111A32f7": (
    <LpIcon swapIconSrc={"/looks.png"} tokenIconSrc={"/weth.png"} />
  ),
  "0xf4d2888d29D722226FafA5d9B24F9164c092421E": (
    <LpIcon swapIconSrc={"/looks.png"} tokenIconSrc={""} />
  ),
  "0xF3A43307DcAFa93275993862Aae628fCB50dC768": (
    <LpIcon swapIconSrc={"/convex.png"} tokenIconSrc={"/frax.webp"} />
  ),
  "0x1054Ff2ffA34c055a13DCD9E0b4c0cA5b3aecEB9": (
    <LpIcon swapIconSrc={"/convex.png"} tokenIconSrc={"/tokens/cadc.png"} />
  ),
  "0xdf55670e27bE5cDE7228dD0A6849181891c9ebA1": (
    <LpIcon swapIconSrc={"/curve.png"} tokenIconSrc={"/tokens/stg.png"} />
  ),
};

const DECIMALS_SCALE = (decimals: number) => ethers.utils.parseUnits("1", 18 - decimals);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const JarGaugeCollapsible: FC<{
  jarData: UserJarData;
  gaugeData: UserGaugeDataWithAPY;
  isYearnJar?: boolean;
}> = ({ jarData, gaugeData, isYearnJar = false }) => {
  const {
    name,
    jarContract,
    depositToken,
    ratio,
    depositTokenName,
    depositTokenDecimals,
    balance,
    deposited,
    usdPerPToken,
    APYs,
    totalAPY,
    depositTokenLink,
    apr,
  } = jarData;
  const { pickleCore } = PickleCore.useContainer();

  const { balance: dillBalance, totalSupply: dillSupply } = useDill();
  const { t } = useTranslation("common");
  const { setButtonStatus } = useButtonStatus();

  const balNum = parseFloat(formatUnits(balance, depositTokenDecimals));
  const depositedNum = parseFloat(formatUnits(deposited, depositTokenDecimals));

  const balStr = formatValue(balNum);

  const depositedStr = formatValue(depositedNum);

  const underlyingStr = (num: BigNumber): string => {
    return formatValue(parseFloat(formatUnits(num, depositTokenDecimals)) * ratio);
  };
  const depositedUnderlyingStr = underlyingStr(deposited);
  const {
    depositToken: gaugeDepositToken,
    balance: gaugeBalance,
    staked,
    harvestable,
    depositTokenName: gaugeDepositTokenName,
    fullApy,
    uncompounded,
  } = gaugeData;
  const stakedUnderlyingStr = underlyingStr(staked);
  const stakedNum = parseFloat(formatUnits(staked, depositTokenDecimals));

  const explanations: RatioAndPendingStrings = getRatioStringAndPendingString(
    usdPerPToken,
    depositedNum,
    stakedNum,
    ratio,
    jarContract.address.toLowerCase(),
    pickleCore,
    t,
  );
  const toLocaleNdigits = (val: number, digits: number) => {
    return val.toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  };

  const valueStr = toLocaleNdigits(usdPerPToken * (depositedNum + stakedNum), 2);
  const valueStrExplained = explanations.ratioString;
  const userSharePendingStr = explanations.pendingString;

  const pickleAPYMin = fullApy * 100 * 0.4;
  const pickleAPYMax = fullApy * 100;

  const dillRatio = +(dillSupply?.toString() || 0)
    ? +(dillBalance?.toString() || 0) / +(dillSupply?.toString() || 1)
    : 0;

  const _balance = stakedNum;
  const _derived = _balance * 0.4;
  const _adjusted = (gaugeData.totalSupply / 10 ** depositTokenDecimals) * dillRatio * 0.6;

  const pickleAPY = (pickleAPYMax * Math.min(_balance, _derived + _adjusted)) / _balance;

  const realAPY = totalAPY + pickleAPY;

  let difference = 0;
  if (APYs !== undefined) {
    const totalAPR1: number = uncompounded
      .map((x) => {
        return Object.values(x)
          .filter((x) => !isNaN(x))
          .reduce((acc, y) => acc + y, 0);
      })
      .reduce((acc, x) => acc + x, 0);
    difference = totalAPY - totalAPR1;
  }

  let apyRangeTooltipText = "APY Range Unavailable.";
  if (APYs !== undefined) {
    apyRangeTooltipText = [
      `${t("farms.baseAPRs")}:`,
      `pickle: ${formatAPY(pickleAPYMin)} ~ ${formatAPY(pickleAPYMax)}`,
      ...APYs.map((x) => {
        const k = Object.keys(x)[0];
        const v = uncompoundAPY(Object.values(x)[0]);
        return isNaN(v) || v > 1e6 ? null : `${k}: ${v.toFixed(2)}%`;
      }),
      isYearnJar
        ? null
        : `${t(
            "farms.compounding",
          )} <img src="/magicwand.svg" height="16" width="16"/>: ${difference.toFixed(2)}%`,
    ]
      .filter((x) => x)
      .join(` <br/> `);
  }

  let yourApyTooltipText = "Your APY is unavailable.";
  if (APYs !== undefined) {
    yourApyTooltipText = [
      `${t("farms.baseAPRs")}:`,
      `pickle: ${formatAPY(pickleAPY)}`,
      ...APYs.map((x) => {
        const k = Object.keys(x)[0];
        const v = uncompoundAPY(Object.values(x)[0]);
        return isNaN(v) || v > 1e6 ? null : `${k}: ${v.toFixed(2)}%`;
      }),
    ]
      .filter((x) => x)
      .join(` <br/> `);
  }

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isExitBatch, setIsExitBatch] = useState<Boolean>(false);
  const [isEntryBatch, setIsEntryBatch] = useState<Boolean>(false);

  const [depositButton, setDepositButton] = useState<ButtonStatus>({
    disabled: false,
    text: t("farms.deposit"),
  });
  const [withdrawButton, setWithdrawButton] = useState<ButtonStatus>({
    disabled: false,
    text: t("farms.withdraw"),
  });

  const [zapStakeButton, setZapStakeButton] = useState<string | null>(null);
  const [zapOnlyButton, setZapOnlyButton] = useState<string | null>(null);
  const [looksMigrateState, setLooksMigrateState] = useState<string | null>(null);

  const {
    status: erc20TransferStatuses,
    transfer,
    getTransferStatus,
  } = ERC20Transfer.useContainer();
  const { signer, address, blockNum } = Connection.useContainer();

  const gauge = signer && GaugeFactory.connect(gaugeData.address, signer);

  const {
    migrateYvboost,
    depositYvboost,
    withdrawGauge,
    withdrawLOOKS,
    depositLOOKS,
    looksBalance,
  } = useMigrate(gaugeDepositToken, 0, gaugeBalance, staked);

  const stakedStr = formatValue(stakedNum);

  const harvestableNum = parseFloat(formatEther(harvestable || 0));

  const harvestableStr = parseFloat(formatEther(harvestable || 0)).toLocaleString();

  const balanceNum = parseFloat(formatUnits(balance, depositTokenDecimals));

  const balanceStr = formatValue(balanceNum);

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
    text: t("farms.harevest"),
  });

  const [depositStakeButton, setDepositStakeButton] = useState<string | null>(null);
  const [exitButton, setExitButton] = useState<string | null>(null);

  const [yvMigrateState, setYvMigrateState] = useState<string | null>(null);
  const [isSuccess, setSuccess] = useState<boolean>(false);
  const zapInputTokens = [
    { symbol: depositTokenName, label: depositTokenName },
    ...zapDefaultTokens.filter((x) => x.symbol != depositTokenName),
  ];
  const [inputToken, setInputToken] = useState(zapInputTokens[0].symbol);
  const { balanceStr: zapBalanceStr, balanceRaw } = useBalance(inputToken);
  const { zapIn } = useZapIn({
    poolAddress: jarContract.address,
    sellTokenAddress: tokenInfo[inputToken as keyof typeof tokenInfo],
    rawAmount: depositAmount || "0",
    slippagePercentage: DEFAULT_SLIPPAGE,
  });

  const depositBalance = zapBalanceStr
    ? balanceRaw
    : balance.mul(DECIMALS_SCALE(depositTokenDecimals));

  const isZap = inputToken != zapInputTokens[0].symbol;

  const isyveCRVFarm = isYveCrvEthJarToken(depositToken.address.toLowerCase());

  const isMimJar = isMainnetMimEthJarDepositToken(depositToken.address.toLowerCase());

  const depositGauge = async () => {
    if (!approved) {
      setDepositStakeButton(t("farms.approving"));
      const Token = erc20?.attach(gaugeDepositToken.address).connect(signer);
      const tx = await Token.approve(gaugeData.address, ethers.constants.MaxUint256);
      await tx.wait();
    }
    setDepositStakeButton(t("farms.staking"));
    const gaugeTx = await gauge.depositAll();
    await gaugeTx.wait();
  };

  const handleYvboostMigrate = async () => {
    if (stakedNum || balanceNum) {
      try {
        setYvMigrateState(t("farms.withdrawingFromFarm"));
        await withdrawGauge(gauge);
        setYvMigrateState(t("farms.migratingTo", { target: "yvBOOST pJar" }));
        await migrateYvboost();
        setYvMigrateState(t("farms.migrated"));
        await depositYvboost();
        setYvMigrateState(null);
        setSuccess(true);
      } catch (error) {
        console.error(error);
        alert(error.message);
        setYvMigrateState(null);
        return;
      }
    }
  };

  const handleLooksMigrate = async () => {
    try {
      setLooksMigrateState(t("farms.looksWithdraw"));
      await withdrawLOOKS();
      setLooksMigrateState(t("farms.looksDeposit"));
      await depositLOOKS();
      setLooksMigrateState(t("farms.looksSuccess"));
    } catch (error) {
      alert(error.message);
      setLooksMigrateState(null);
      return;
    }
  };

  const depositAndStake = async () => {
    if (isZap) {
      handleZap(true);
      return;
    }
    if (balNum) {
      try {
        setIsEntryBatch(true);
        const res = await transfer({
          token: depositToken.address,
          recipient: jarContract.address,
          approvalAmountRequired: convertDecimals(depositAmount),
          transferCallback: async () => {
            return jarContract.connect(signer).deposit(convertDecimals(depositAmount));
          },
        });
        if (!res) throw "Deposit Failed";
        await depositGauge();
        await sleep(10000);
        setDepositStakeButton(null);
        setIsEntryBatch(false);
      } catch (error) {
        console.error(error);
        setIsEntryBatch(false);
        return;
      }
    }
  };

  const exit = async () => {
    if (stakedNum) {
      try {
        setIsExitBatch(true);
        setExitButton(t("farms.unstakingFromFarm"));
        const exitTx = await gauge.exit();
        await exitTx.wait();
        setExitButton(t("farms.withdrawingFromJar"));
        const withdrawTx = await jarContract
          .connect(signer)
          .withdrawAll(gasLimit(jarContract.address, JarInteraction.WithdrawAll));
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

  const handleZap = async (toFarm = false) => {
    if (depositAmount) {
      {
        try {
          setZapOnlyButton(t("zap.zapping"));
          setZapStakeButton(t("zap.zapping"));
          const zapSuccess = await zapIn();
          if (toFarm && zapSuccess) {
            setZapStakeButton(t("farms.staking"));
            await depositGauge();
          }
          await sleep(10000);
          setDepositStakeButton(null);
          setZapOnlyButton(null);
          setZapStakeButton(null);
        } catch (error) {
          console.error(error);
          alert(error.message);
          setDepositStakeButton(null);
          setZapOnlyButton(null);
          setZapStakeButton(null);
          return;
        }
      }
    }
  };

  const convertDecimals = (num: string) => ethers.utils.parseUnits(num, depositTokenDecimals);

  useEffect(() => {
    if (jarData && !isExitBatch) {
      const dStatus = getTransferStatus(depositToken.address, jarContract.address);
      const wStatus = getTransferStatus(jarContract.address, jarContract.address);

      setButtonStatus(dStatus, t("farms.depositing"), t("farms.deposit"), setDepositButton);
      setButtonStatus(wStatus, t("farms.withdrawing"), t("farms.withdraw"), setWithdrawButton);
    }
    if (gaugeData && !isExitBatch) {
      const stakeStatus = getTransferStatus(gaugeDepositToken.address, gaugeData.address);
      const unstakeStatus = getTransferStatus(gaugeData.address, gaugeDepositToken.address);
      const harvestStatus = getTransferStatus(gaugeData.address, "harvest");
      const exitStatus = getTransferStatus(gaugeData.address, "exit");

      setButtonStatus(
        stakeStatus,
        t("farms.staking"),
        t("farms.stakeUnstaked", { amount: depositedStr }),
        setStakeButton,
      );
      setButtonStatus(unstakeStatus, t("farms.unstaking"), t("farms.unstake"), setUnstakeButton);
      setButtonStatus(harvestStatus, t("farms.harvesting"), t("farms.harvest"), setHarvestButton);
    }
  }, [erc20TransferStatuses, jarData]);
  const { erc20 } = Contracts.useContainer();
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    const checkAllowance = async () => {
      if (erc20 && address && signer) {
        const Token = erc20.attach(gaugeDepositToken.address).connect(signer);
        const allowance = await Token.allowance(address, gaugeData.address);
        if (allowance.gt(ethers.constants.Zero)) {
          setApproved(true);
        }
      }
    };
    checkAllowance();
  }, [blockNum, address, erc20]);

  const tvlJarData = pickleCore?.assets.jars.filter(
    (x) => x.depositToken.addr.toLowerCase() === depositToken.address.toLowerCase(),
  )[0];
  const tvlNum =
    tvlJarData && tvlJarData.details.harvestStats ? tvlJarData.details.harvestStats.balanceUSD : 0;
  const tvlStr = getFormatString(tvlNum);
  const foundJar: JarDefinition | undefined = pickleCore?.assets.jars.find(
    (x) => x.depositToken.addr.toLowerCase() === depositToken.address.toLowerCase(),
  );
  const isClosingOnly = foundJar ? isJarWithdrawOnly(foundJar.details.apiKey, pickleCore) : false;

  return (
    <Collapse
      style={{ borderWidth: "1px", boxShadow: "none" }}
      shadow
      preview={
        <Grid.Container gap={1}>
          <JarName xs={24} sm={12} md={6} lg={6}>
            <TokenIcon
              src={
                JAR_DEPOSIT_TOKEN_TO_ICON[
                  depositToken.address as keyof typeof JAR_DEPOSIT_TOKEN_TO_ICON
                ]
              }
            />
            <div style={{ width: "100%" }}>
              <div style={{ fontSize: `1rem` }}>{name}</div>
              <a href={depositTokenLink} target="_" style={{ fontSize: `1rem` }}>
                {depositTokenName}
              </a>
            </div>
          </JarName>
          <Grid xs={24} sm={12} md={3} lg={3} css={{ textAlign: "center" }}>
            <Data isZero={balanceNum === 0}>{balanceStr}</Data>
            <Label>{t("balances.walletBalance")}</Label>
          </Grid>
          <Grid xs={24} sm={12} md={3} lg={3} css={{ textAlign: "center" }}>
            <Data isZero={harvestableNum === 0}>
              {harvestableStr} {Boolean(harvestableNum) && <MiniIcon source={"/pickle.png"} />}
            </Data>
            <Label>{t("balances.earned")}</Label>
          </Grid>
          <Grid xs={24} sm={12} md={4} lg={4} css={{ textAlign: "center" }}>
            <>
              <Data isZero={+valueStr == 0}>${valueStr}</Data>
              <Label>{t("balances.depositValue")}</Label>
              {Boolean(valueStrExplained !== undefined) && <Label>{valueStrExplained}</Label>}
              {Boolean(userSharePendingStr !== undefined) && <Label>{userSharePendingStr}</Label>}
            </>
          </Grid>
          <Grid xs={24} sm={24} md={4} lg={4} css={{ textAlign: "center" }}>
            {isClosingOnly ? (
              <div>--</div>
            ) : !gaugeData ? (
              <Data>
                <Tooltip text={ReactHtmlParser(apyRangeTooltipText)}>
                  {totalAPY.toFixed(2) + "%" || "--"}
                </Tooltip>
                <img src="/question.svg" width="15px" style={{ marginLeft: 5 }} />
                <div>
                  <span>{t("balances.APY")}</span>
                </div>
              </Data>
            ) : (
              <div>
                <div>
                  <Tooltip
                    text={
                      totalAPY + fullApy === 0 ? "--" : <>{ReactHtmlParser(apyRangeTooltipText)}</>
                    }
                  >
                    <div style={{ display: "flex" }}>
                      <span>
                        {totalAPY + fullApy === 0
                          ? "--%"
                          : `${formatAPY(totalAPY + pickleAPYMin)}~${formatAPY(
                              totalAPY + pickleAPYMax,
                            )}`}
                      </span>
                      <img src="/question.svg" width="15px" style={{ marginLeft: 5 }} />
                    </div>
                    <Label>{t("balances.apyRange")}</Label>
                  </Tooltip>
                </div>
                {Boolean(realAPY) && (
                  <div>
                    <Tooltip
                      text={realAPY === 0 ? "--" : ReactHtmlParser(yourApyTooltipText)}
                      style={{ marginTop: 5 }}
                    >
                      <div style={{ display: "flex" }}>
                        <Label>{t("balances.yourApy")}:&nbsp;</Label>
                        <div>{!realAPY ? "--%" : `${realAPY.toFixed(2)}%`}</div>
                      </div>
                    </Tooltip>
                  </div>
                )}
              </div>
            )}
          </Grid>
          <Grid xs={24} sm={12} md={4} lg={4} css={{ textAlign: "center" }}>
            <Data isZero={tvlNum === 0}>${tvlStr}</Data>
            <Label>{t("balances.tvl")}</Label>
          </Grid>
        </Grid.Container>
      }
    >
      <Spacer y={1} />
      <Grid.Container gap={2}>
        <Grid xs={24} md={depositedNum && (!isEntryBatch || stakedNum) ? 12 : 24}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              {t("balances.balance")}:{" "}
              {inputToken === zapInputTokens[0].symbol
                ? `${balStr} ${depositTokenName}`
                : `${
                    zapBalanceStr !== null ? formatValue(parseFloat(zapBalanceStr)) : 0
                  } ${inputToken}`}
            </div>
            <Link
              color
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setDepositAmount(formatUnits(depositBalance, depositTokenDecimals));
              }}
            >
              {t("balances.max")}
            </Link>
          </div>
          <Grid.Container gap={3}>
            <Grid md={8}>
              <Select
                size="medium"
                width="100%"
                value={inputToken}
                onChange={(e) => setInputToken(e.toString())}
              >
                {zapInputTokens.map((token) => (
                  <Select.Option
                    style={{ fontSize: "1rem" }}
                    value={token.symbol}
                    key={token.symbol}
                  >
                    <div style={{ display: `flex`, alignItems: `center` }}>{token.label}</div>
                  </Select.Option>
                ))}
              </Select>
            </Grid>
            <Grid md={16}>
              <Input
                onChange={(e) => setDepositAmount(e.target.value)}
                value={depositAmount}
                width="100%"
              ></Input>
            </Grid>
          </Grid.Container>
          <Spacer y={0.5} />
          <Grid.Container gap={1}>
            <Grid xs={24} md={12}>
              <Button
                onClick={() => {
                  if (signer && !isZap) {
                    // Allow Jar to get LP Token
                    transfer({
                      token: depositToken.address,
                      recipient: jarContract.address,
                      approvalAmountRequired: convertDecimals(depositAmount),
                      transferCallback: async () => {
                        return jarContract.connect(signer).deposit(convertDecimals(depositAmount));
                      },
                    });
                  }
                  if (signer && isZap) {
                    handleZap();
                  }
                }}
                disabled={depositButton.disabled || isClosingOnly || zapOnlyButton}
                style={{ width: "100%" }}
              >
                {isZap ? zapOnlyButton || t("zap.zapIntoJar") : depositButton.text}
                {isZap && ZapperIcon}
              </Button>
              {isMimJar ? <StyledNotice>{t("farms.abra.rewardsEnded")}</StyledNotice> : null}
              {isClosingOnly ? <StyledNotice>{t("farms.closingOnly")}</StyledNotice> : null}
            </Grid>
            <Grid xs={24} md={12}>
              <Button
                onClick={depositAndStake}
                disabled={
                  Boolean(depositStakeButton) ||
                  Boolean(zapStakeButton) ||
                  isClosingOnly ||
                  depositButton.disabled
                }
                style={{ width: "100%" }}
              >
                {isZap
                  ? zapStakeButton || t("zap.zapAndStake")
                  : isEntryBatch
                  ? depositStakeButton || depositButton.text
                  : t("farms.depositAndStake")}
                {isZap && ZapperIcon}
              </Button>
            </Grid>
          </Grid.Container>
        </Grid>
        {depositedNum !== 0 && (!isEntryBatch || stakedNum) && (
          <Grid xs={24} md={12}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                {t("balances.balance")}: {depositedStr} ({depositedUnderlyingStr} {depositTokenName}
                ){" "}
              </div>
              <Link
                color
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setWithdrawAmount(formatUnits(deposited, depositTokenDecimals));
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
                        .withdraw(
                          convertDecimals(withdrawAmount),
                          gasLimit(jarContract.address, JarInteraction.Withdraw),
                        );
                    },
                    approval: false,
                  });
                }
              }}
              style={{ width: "100%" }}
            >
              {withdrawButton.text}
            </Button>
          </Grid>
        )}
      </Grid.Container>
      <Spacer y={1} />
      {Boolean(depositedNum || stakedNum) && (
        <Grid.Container gap={2}>
          {depositedNum && !isExitBatch && !isEntryBatch && (
            <Grid xs={24} md={(depositedNum && !stakedNum) || isEntryBatch ? 24 : 12}>
              <Spacer y={1.2} />
              <Button
                disabled={stakeButton.disabled || isyveCRVFarm}
                onClick={() => {
                  if (gauge && signer) {
                    transfer({
                      token: gaugeDepositToken.address,
                      recipient: gauge.address,
                      transferCallback: async () => {
                        return gauge.depositAll();
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
              md={(!depositedNum || isEntryBatch || isExitBatch) && stakedNum ? 24 : 12}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  {t("balances.staked")}: {stakedStr} {gaugeDepositTokenName} ({stakedUnderlyingStr}{" "}
                  {depositTokenName}){" "}
                </div>
                <Link
                  color
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setUnstakeAmount(formatUnits(staked, depositTokenDecimals));
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
      {(Boolean(stakedNum) || Boolean(harvestableNum)) && (
        <>
          <Spacer y={0.5} />
          <Grid.Container gap={2}>
            <Grid xs={24} md={stakedNum ? 12 : 24}>
              <Button
                disabled={harvestButton.disabled}
                onClick={() => {
                  if (gauge && signer) {
                    transfer({
                      token: gauge.address,
                      recipient: gauge.address, // Doesn't matter since we don't need approval
                      approval: false,
                      transferCallback: async () => {
                        return gauge.getReward();
                      },
                    });
                  }
                }}
                style={{ width: "100%" }}
              >
                {harvestButton.text} {harvestableStr} $PICKLES
              </Button>
            </Grid>
            {Boolean(stakedNum) && (
              <Grid xs={24} md={12}>
                <Button
                  disabled={unstakeButton.disabled}
                  onClick={() => {
                    if (gauge && signer) {
                      transfer({
                        token: gauge.address,
                        recipient: gaugeDepositToken.address,
                        approval: false,
                        transferCallback: async () => {
                          return convertDecimals(unstakeAmount).eq(staked)
                            ? gauge.exit()
                            : gauge.withdraw(convertDecimals(unstakeAmount));
                        },
                      });
                    }
                  }}
                  style={{ width: "100%" }}
                >
                  {unstakeButton.text}
                </Button>
              </Grid>
            )}
          </Grid.Container>
        </>
      )}
      <Spacer y={0.5} />
      <Grid.Container gap={2}>
        {Boolean(stakedNum || isExitBatch) && (
          <>
            <Grid xs={24} md={24}>
              <Button disabled={exitButton || isExitBatch} onClick={exit} style={{ width: "100%" }}>
                {exitButton || t("farms.harvestAndExit")}
              </Button>
            </Grid>
          </>
        )}
        {isyveCRVFarm && (
          <Grid xs={24}>
            <Button
              disabled={yvMigrateState !== null}
              onClick={handleYvboostMigrate}
              style={{ width: "100%", textTransform: "none" }}
            >
              {yvMigrateState ||
                t("farms.migrateFromTo", {
                  from: "yveCRV-ETH LP",
                  to: "yvBOOST-ETH LP",
                })}
            </Button>
            <div
              style={{
                width: "100%",
                textAlign: "center",
                fontFamily: "Source Sans Pro",
                fontSize: "1rem",
              }}
            >
              <Trans i18nKey="farms.yvBOOSTMigration">
                Your tokens will be unstaked and migrated to the yvBOOST pJar and staked in the
                Farm.
                <br />
                This process will require a number of transactions.
                <br />
                Learn more about yvBOOST
                <a target="_" href="https://twitter.com/iearnfinance/status/1388131568481411077">
                  here
                </a>
                .
              </Trans>
              {isSuccess ? (
                <p style={{ fontWeight: "bold" }}>
                  <Trans i18nKey="farms.migrationCompleted">
                    Migration completed! See your deposits
                    <Link color href="/farms">
                      here
                    </Link>
                  </Trans>
                </p>
              ) : null}
            </div>
          </Grid>
        )}
        {isLooksJar(depositToken.address) && (
          <Grid xs={24}>
            <Button
              disabled={looksMigrateState !== null || looksBalance.isZero()}
              onClick={handleLooksMigrate}
              style={{ width: "100%", textTransform: "none" }}
            >
              {looksMigrateState ||
                t("farms.looksDefault", {
                  amount: (+formatEther(looksBalance)).toFixed(2),
                })}
            </Button>
            <div
              style={{
                width: "100%",
                textAlign: "center",
                fontFamily: "Source Sans Pro",
                fontSize: "1rem",
              }}
            >
              <Spacer y={0.5} />
              <p>{t("farms.looksMigration")}</p>
            </div>
          </Grid>
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
