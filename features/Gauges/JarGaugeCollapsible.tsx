import { ethers } from "ethers";
import styled from "styled-components";

import { useState, FC, useEffect, ReactNode } from "react";
import { Button, Link, Input, Grid, Spacer, Tooltip } from "@geist-ui/react";

import { Connection } from "../../containers/Connection";
import { formatEther } from "ethers/lib/utils";
import { Contracts } from "../../containers/Contracts";
import {
  ERC20Transfer,
  Status as ERC20TransferStatus,
} from "../../containers/Erc20Transfer";
import Collapse from "../Collapsible/Collapse";
import { UserJarData } from "../../containers/UserJars";
import { LpIcon, TokenIcon } from "../../components/TokenIcon";
import { JAR_DEPOSIT_TOKENS } from "../../containers/Jars/jars";
import { UserGaugeData } from "../../containers/UserGauges";
import { useDill } from "../../containers/Dill";
import { useMigrate } from "../Farms/UseMigrate";
import { Gauge__factory as GaugeFactory } from "../../containers/Contracts/factories/Gauge__factory";
import { getProtocolData } from "../../util/api";
import { GAUGE_TVL_KEY, getFormatString } from "./GaugeInfo";
import { worker } from "cluster";
import { getRealShape } from "../Collapsible/useRealShape";

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
interface ButtonStatus {
  disabled: boolean;
  text: string;
}

const JarName = styled(Grid)({
  display: "flex",
});

const formatAPY = (apy: number) => {
  if (apy === Number.POSITIVE_INFINITY) return "∞%";
  return apy.toFixed(2) + "%";
};

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
  "0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c": (
    <LpIcon swapIconSrc={"/curve.png"} tokenIconSrc={"/alchemix.png"} />
  ),
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
};

const USDC_SCALE = ethers.utils.parseUnits("1", 12);

const setButtonStatus = (
  status: ERC20TransferStatus,
  transfering: string,
  idle: string,
  setButtonText: (arg0: ButtonStatus) => void,
) => {
  // Deposit
  if (status === ERC20TransferStatus.Approving) {
    setButtonText({
      disabled: true,
      text: "Approving...",
    });
  }
  if (status === ERC20TransferStatus.Transfering) {
    setButtonText({
      disabled: true,
      text: transfering,
    });
  }
  if (
    status != ERC20TransferStatus.Approving &&
    status != ERC20TransferStatus.Transfering
  ) {
    setButtonText({
      disabled: false,
      text: idle,
    });
  }
};

export const JarGaugeCollapsible: FC<{
  jarData: UserJarData;
  gaugeData: UserGaugeData;
  isYearnJar?: boolean;
}> = ({ jarData, gaugeData, isYearnJar = false }) => {
  const {
    name,
    jarContract,
    depositToken,
    ratio,
    depositTokenName,
    balance,
    deposited,
    usdPerPToken,
    APYs,
    totalAPY,
    depositTokenLink,
    apr,
    pendingAlcx,
  } = jarData;

  const { balance: dillBalance, totalSupply: dillSupply } = useDill();

  const isUsdc =
    depositToken.address.toLowerCase() ===
    JAR_DEPOSIT_TOKENS.USDC.toLowerCase();

  const balNum = parseFloat(
    formatEther(isUsdc && balance ? balance.mul(USDC_SCALE) : balance),
  );
  const depositedNum = parseFloat(
    formatEther(isUsdc && deposited ? deposited.mul(USDC_SCALE) : deposited),
  );

  const balStr = balNum.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: balNum < 1 ? 6 : 2,
  });

  const depositedStr = depositedNum.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: depositedNum < 1 ? 6 : 2,
  });

  const depositedUnderlyingStr = (
    parseFloat(
      formatEther(isUsdc && deposited ? deposited.mul(USDC_SCALE) : deposited),
    ) * ratio
  ).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: depositedNum < 1 ? 6 : 2,
  });
  const valueStr = (usdPerPToken * depositedNum).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const {
    depositToken: gaugeDepositToken,
    balance: gaugeBalance,
    staked,
    harvestable,
    depositTokenName: gaugeDepositTokenName,
    fullApy,
  } = gaugeData;

  const gaugeBal = parseFloat(
    formatEther(
      isUsdc && gaugeBalance ? gaugeBalance.mul(USDC_SCALE) : gaugeBalance,
    ),
  );

  const gaugeBalStr = gaugeBal.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: gaugeBal < 1 ? 18 : 4,
  });

  const stakedNum = parseFloat(
    formatEther(isUsdc && staked ? staked.mul(USDC_SCALE) : staked),
  );

  const pickleAPYMin = fullApy * 100 * 0.4;
  const pickleAPYMax = fullApy * 100;

  const dillRatio = +(dillSupply?.toString() || 0)
    ? +(dillBalance?.toString() || 0) / +(dillSupply?.toString() || 1)
    : 0;

  const _balance = stakedNum;
  const _derived = _balance * 0.4;
  const _adjusted =
    (gaugeData.totalSupply / (isUsdc ? 1e6 : 1e18)) * dillRatio * 0.6;

  const pickleAPY =
    (pickleAPYMax * Math.min(_balance, _derived + _adjusted)) / _balance;

  const realAPY = totalAPY + pickleAPY;

  const apyRangeTooltipText = [
    `pickle: ${formatAPY(pickleAPYMin)} ~ ${formatAPY(pickleAPYMax)}`,
    ...APYs.map((x) => {
      const k = Object.keys(x)[0];
      const v = Object.values(x)[0];
      return isNaN(v) || v > 1e6 ? null : `${k}: ${v.toFixed(2)}%`;
    }),
  ]
    .filter((x) => x)
    .join(" + ");
  const yourApyTooltipText = [
    `pickle: ${formatAPY(pickleAPY)}`,
    ...APYs.map((x) => {
      const k = Object.keys(x)[0];
      const v = Object.values(x)[0];
      return isNaN(v) || v > 1e6 ? null : `${k}: ${v.toFixed(2)}%`;
    }),
  ].filter((x) => x);

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [tvlData, setTVLData] = useState();

  const [depositButton, setDepositButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Deposit",
  });
  const [withdrawButton, setWithdrawButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Withdraw",
  });

  const {
    status: erc20TransferStatuses,
    transfer,
    getTransferStatus,
  } = ERC20Transfer.useContainer();
  const { signer, address, blockNum } = Connection.useContainer();

  const gauge = signer && GaugeFactory.connect(gaugeData.address, signer);

  const { migrateYvboost, depositYvboost, withdrawGauge } = useMigrate(
    gaugeDepositToken,
    0,
    gaugeBalance,
    staked,
  );

  const stakedStr = stakedNum.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: stakedNum < 1 ? 18 : 4,
  });

  const harvestableStr = parseFloat(
    formatEther(harvestable || 0),
  ).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: depositedNum < 1 ? 6 : 2,
  });

  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");

  const [stakeButton, setStakeButton] = useState<ButtonStatus>({
    disabled: false,
    text: `Stake Unstaked ${depositedStr} Tokens in Farm`,
  });
  const [unstakeButton, setUnstakeButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Unstake",
  });
  const [harvestButton, setHarvestButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Harvest",
  });

  const [depositStakeButton, setDepositStakeButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Deposit and Stake"
  })
  const [exitButton, setExitButton] = useState<string | null>(null);

  const [yvMigrateState, setYvMigrateState] = useState<string | null>(null);
  const [isSuccess, setSuccess] = useState<boolean>(false);

  const balanceNum = parseFloat(
    formatEther(
      isUsdc && gaugeBalance ? gaugeBalance.mul(USDC_SCALE) : balance,
    ),
  );

  const isyveCRVFarm =
    depositToken.address.toLowerCase() ===
    JAR_DEPOSIT_TOKENS.SUSHI_ETH_YVECRV.toLowerCase();

  const handleYvboostMigrate = async () => {
    if (stakedNum || balanceNum) {
      try {
        setYvMigrateState("Withdrawing from Farm...");
        await withdrawGauge(gauge);
        setYvMigrateState("Migrating to yvBOOST pJar...");
        await migrateYvboost();
        setYvMigrateState("Migrated! Staking in Farm...");
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

  const depositAndStake = async () => {
    if (balNum) {
      try {
        await setDepositStakeButton(depositButton);
        await transfer({
          token: depositToken.address,
          recipient: jarContract.address,
          transferCallback: async () => {
            return jarContract
              .connect(signer)
              .deposit(ethers.utils.parseUnits(depositAmount, isUsdc ? 6 : 18));
          },
        });
        await setDepositStakeButton(stakeButton)
        await gauge.deposit(
          isUsdc && gaugeBalance ? gaugeBalance.mul(USDC_SCALE) : gaugeBalance,
        );
      } catch (error) {
        console.error(error);
        return;
      }
    }
  };

  const exit = async () => {
    if (stakedNum) {
      try {
        setExitButton("Unstaking from Farm...");
        await gauge.exit();
        setExitButton("Withdrawing from Jar...");
        await jarContract
          .connect(signer)
          .withdraw(balance);
        setExitButton(null);
      } catch (error) {
        console.error(error);
        setExitButton(null);
        return;
      }
    }
  };

  useEffect(() => {
    if (jarData) {
      const dStatus = getTransferStatus(
        depositToken.address,
        jarContract.address,
      );
      const wStatus = getTransferStatus(
        jarContract.address,
        jarContract.address,
      );

      setButtonStatus(dStatus, "Depositing...", "Deposit", setDepositButton);
      setButtonStatus(wStatus, "Withdrawing...", "Withdraw", setWithdrawButton);
    }
    if (gaugeData) {
      const stakeStatus = getTransferStatus(
        gaugeDepositToken.address,
        gaugeData.address,
      );
      const unstakeStatus = getTransferStatus(
        gaugeData.address,
        gaugeDepositToken.address,
      );
      const harvestStatus = getTransferStatus(gaugeData.address, "harvest");
      const exitStatus = getTransferStatus(gaugeData.address, "exit");

      setButtonStatus(
        stakeStatus,
        "Staking...",
        `Stake Unstaked ${depositedStr} Tokens in Farm`,
        setStakeButton,
      );
      setButtonStatus(
        unstakeStatus,
        "Unstaking...",
        "Unstake",
        setUnstakeButton,
      );
      setButtonStatus(
        harvestStatus,
        "Harvesting...",
        "Harvest",
        setHarvestButton,
      );
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

  const [json, setJson] = useState(null);
  useEffect(() => {
    getProtocolData().then((info) => setTVLData(info));
  }, []);

  const tooltipText = APYs.map((x) => {
    const k = Object.keys(x)[0];
    const v = Object.values(x)[0];
    return isNaN(v) ? null : `${k}: ${v.toFixed(2)}%`;
  })
    .filter((x) => x)
    .join(" + ");

  const isDisabledJar =
    depositToken.address === JAR_DEPOSIT_TOKENS.UNIV2_BAC_DAI ||
    depositToken.address === JAR_DEPOSIT_TOKENS.UNIV2_BAS_DAI ||
    depositToken.address === JAR_DEPOSIT_TOKENS.UNIV2_LUSD_ETH;

  const isMStonksJar =
    depositToken.address === JAR_DEPOSIT_TOKENS.UNIV2_MIR_UST ||
    depositToken.address === JAR_DEPOSIT_TOKENS.UNIV2_MAAPL_UST ||
    depositToken.address === JAR_DEPOSIT_TOKENS.UNIV2_MBABA_UST ||
    depositToken.address === JAR_DEPOSIT_TOKENS.UNIV2_MSLV_UST ||
    depositToken.address === JAR_DEPOSIT_TOKENS.UNIV2_MQQQ_UST ||
    depositToken.address === JAR_DEPOSIT_TOKENS.UNIV2_MTSLA_UST;
  const isAlusdJar =
    depositToken.address === JAR_DEPOSIT_TOKENS.ALCX_ALUSD_3CRV;

  let lunaAPY;
  if (isMStonksJar && APYs[2]) {
    lunaAPY = APYs[2].luna;
  } else if (isMStonksJar && APYs[1]) {
    lunaAPY = APYs[1].luna;
  } else {
    lunaAPY = 0;
  }

  const renderTooltip = () => {
    if (isYearnJar) {
      return `This jar deposits into Yearn's ${
        APYs[1].vault
      }, The base rate of ${apr.toFixed(
        2,
      )}% is provided by the underlying Yearn strategy`;
    } else if (isAlusdJar) {
      return `ALCX rewards are harvested and staked to accelerate your ALCX earnings. 
      You will receive alUSD3CRV and ALCX tokens on withdrawal.`;
    } else {
      return `This yield is calculated in real time from a base rate of ${apr.toFixed(
        2,
      )}% which we auto-compound regularly.`;
    }
  };

  const tvlNum =
    tvlData &&
    GAUGE_TVL_KEY[depositToken.address] &&
    tvlData[GAUGE_TVL_KEY[depositToken.address]]
      ? tvlData[GAUGE_TVL_KEY[depositToken.address]]
      : 0;
  const tvlStr = getFormatString(tvlNum);

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
              <a
                href={depositTokenLink}
                target="_"
                style={{ fontSize: `1rem` }}
              >
                {depositTokenName}
              </a>
            </div>
          </JarName>
          <Grid xs={24} sm={12} md={4} lg={4} css={{ textAlign: "center" }}>
            <Data isZero={depositedNum === 0}>{depositedStr}</Data>
            <Label>Deposited</Label>
          </Grid>
          <Grid xs={24} sm={12} md={3} lg={3} css={{ textAlign: "center" }}>
            <Data isZero={parseFloat(formatEther(harvestable || 0)) === 0}>
              {harvestableStr}
            </Data>
            <Label>Earned</Label>
          </Grid>
          <Grid xs={24} sm={12} md={3} lg={3} css={{ textAlign: "center" }}>
            {isAlusdJar ? (
              <Tooltip
                text={`Pending ALCX rewards: ${pendingAlcx?.toFixed(3)}`}
              >
                <Data isZero={usdPerPToken * depositedNum === 0}>
                  ${valueStr}
                </Data>
                <Label>Value</Label>
              </Tooltip>
            ) : (
              <>
                <Data isZero={usdPerPToken * depositedNum === 0}>
                  ${valueStr}
                </Data>
                <Label>Value</Label>
              </>
            )}
          </Grid>
          <Grid xs={24} sm={24} md={4} lg={4} css={{ textAlign: "center" }}>
            {!gaugeData ? (
              <Data>
                <Tooltip text={tooltipText}>
                  {totalAPY.toFixed(2) + "%" || "--"}
                </Tooltip>
                {isMStonksJar && lunaAPY && (
                  <>
                    <span>+{lunaAPY.toFixed(2)} %</span>
                    <Tooltip text="LUNA rewards are additionally rewarded to depositors for 2 weeks. These rewards will be airdropped at the end of the 2 week period">
                      <img
                        src="./luna.webp"
                        width="15px"
                        style={{ marginLeft: 5 }}
                      />
                    </Tooltip>
                  </>
                )}
                <img
                  src="./question.svg"
                  width="15px"
                  style={{ marginLeft: 5 }}
                />
                <div>
                  <Tooltip text={renderTooltip()}>
                    <span>APY</span>
                  </Tooltip>
                </div>
              </Data>
            ) : (
              <div>
                <div>
                  <Tooltip
                    text={totalAPY + fullApy === 0 ? "--" : apyRangeTooltipText}
                  >
                    <div style={{ display: "flex" }}>
                      <span>
                        {totalAPY + fullApy === 0
                          ? "--%"
                          : `${formatAPY(totalAPY + pickleAPYMin)}~${formatAPY(
                              totalAPY + pickleAPYMax,
                            )}`}
                      </span>
                      <img
                        src="./question.svg"
                        width="15px"
                        style={{ marginLeft: 5 }}
                      />
                    </div>
                    <Label>APY Range</Label>
                  </Tooltip>
                </div>
                <div>
                  <Tooltip
                    text={realAPY === 0 ? "--" : yourApyTooltipText}
                    style={{ marginTop: 5 }}
                  >
                    <div style={{ display: "flex" }}>
                      <Label>Your APY: </Label>
                      <div>{!realAPY ? "--%" : `${realAPY.toFixed(2)}%`}</div>
                    </div>
                  </Tooltip>
                </div>
              </div>
            )}
          </Grid>
          <Grid xs={24} sm={12} md={4} lg={4} css={{ textAlign: "center" }}>
            <Data isZero={tvlNum === 0}>${tvlStr}</Data>
            <Label>TVL</Label>
          </Grid>
        </Grid.Container>
      }
    >
      <Spacer y={1} />
      <Grid.Container gap={2}>
        <Grid xs={24} md={depositedNum ? 12 : 24}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              Balance: {balStr} {depositTokenName}
            </div>
            <Link
              color
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setDepositAmount(
                  formatEther(
                    isUsdc && balance ? balance.mul(USDC_SCALE) : balance,
                  ),
                );
              }}
            >
              Max
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
                  if (signer && !isDisabledJar) {
                    // Allow Jar to get LP Token
                    transfer({
                      token: depositToken.address,
                      recipient: jarContract.address,
                      transferCallback: async () => {
                        return jarContract
                          .connect(signer)
                          .deposit(
                            ethers.utils.parseUnits(
                              depositAmount,
                              isUsdc ? 6 : 18,
                            ),
                          );
                      },
                    });
                  }
                }}
                disabled={
                  depositButton.disabled ||
                  depositTokenName === "DAI" ||
                  isDisabledJar
                }
                style={{ width: "100%" }}
              >
                {depositButton.text}
              </Button>
            </Grid>
            <Grid xs={24} md={12}>
              <Button
                onClick={depositAndStake}
                disabled={depositButton.disabled || isDisabledJar}
                style={{ width: "100%" }}
              >
                {depositStakeButton.text || "Deposit and Stake"}
              </Button>
            </Grid>
          </Grid.Container>
        </Grid>
        {depositedNum !== 0 && (
          <Grid xs={24} md={12}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                Balance {depositedStr} (
                <Tooltip
                  text={`${
                    deposited && ratio
                      ? parseFloat(
                          formatEther(
                            isUsdc && deposited
                              ? deposited.mul(USDC_SCALE)
                              : deposited,
                          ),
                        ) * ratio
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
                  setWithdrawAmount(
                    formatEther(isUsdc ? deposited.mul(USDC_SCALE) : deposited),
                  );
                }}
              >
                Max
              </Link>
            </div>
            <Input
              onChange={(e) => setWithdrawAmount(e.target.value)}
              value={withdrawAmount}
              width="100%"
            ></Input>
            <Spacer y={0.5} />
            <Button
              disabled={withdrawButton.disabled || isDisabledJar}
              onClick={() => {
                if (signer && !isDisabledJar) {
                  // Allow pToken to burn its pToken
                  // and refund lpToken
                  transfer({
                    token: jarContract.address,
                    recipient: jarContract.address,
                    transferCallback: async () => {
                      return jarContract
                        .connect(signer)
                        .withdraw(
                          ethers.utils.parseUnits(
                            withdrawAmount,
                            isUsdc ? 6 : 18,
                          ),
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
          {depositedNum && (
            <Grid xs={24} md={depositedNum && !stakedNum ? 24 : 12}>
              <Spacer y={0.5} />
              <Button
                disabled={stakeButton.disabled || isyveCRVFarm}
                onClick={() => {
                  if (gauge && signer) {
                    transfer({
                      token: gaugeDepositToken.address,
                      recipient: gauge.address,
                      transferCallback: async () => {
                        return gauge.deposit(
                          isUsdc && gaugeBalance
                            ? gaugeBalance.mul(USDC_SCALE)
                            : gaugeBalance,
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

          {Boolean(!depositedNum && stakedNum) && (
            <Grid xs={24} md={!depositedNum && stakedNum ? 24 : 12}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  Staked: {stakedStr} {gaugeDepositTokenName}
                </div>
                <Link
                  color
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setUnstakeAmount(
                      formatEther(isUsdc ? staked.mul(USDC_SCALE) : staked),
                    );
                  }}
                >
                  Max
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
                        return gauge.withdraw(
                          ethers.utils.parseUnits(
                            unstakeAmount,
                            isUsdc ? 6 : 18,
                          ),
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
          <Spacer y={0.5} />
          <Grid.Container gap={2}>
            <Grid xs={24} md={24}>
              <Button
                disabled={harvestButton.disabled}
                onClick={exit}
                style={{ width: "100%" }}
              >
                {exitButton || "Harvest and Exit"}
              </Button>
            </Grid>
            {isyveCRVFarm && (
              <Grid xs={24}>
                <Button
                  disabled={yvMigrateState !== null}
                  onClick={handleYvboostMigrate}
                  style={{ width: "100%", textTransform: "none" }}
                >
                  {yvMigrateState || "Migrate yveCRV-ETH LP to yvBOOST-ETH LP"}
                </Button>
                <div
                  style={{
                    width: "100%",
                    textAlign: "center",
                    fontFamily: "Source Sans Pro",
                    fontSize: "1rem",
                  }}
                >
                  Your tokens will be unstaked and migrated to the yvBOOST pJar
                  and staked in the Farm.
                  <br />
                  This process will require a number of transactions.
                  <br />
                  Learn more about yvBOOST{" "}
                  <a
                    target="_"
                    href="https://twitter.com/iearnfinance/status/1388131568481411077"
                  >
                    here
                  </a>
                  .
                  {isSuccess ? (
                    <p style={{ fontWeight: "bold" }}>
                      Migration completed! See your deposits{" "}
                      <Link color href="/farms">
                        here
                      </Link>
                    </p>
                  ) : null}
                </div>
              </Grid>
            )}
          </Grid.Container>
        </>
      )}
    </Collapse>
  );
};
