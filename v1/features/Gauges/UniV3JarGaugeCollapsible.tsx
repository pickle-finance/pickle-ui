import { BigNumber, ethers } from "ethers";
import styled from "styled-components";
import { Trans, useTranslation } from "next-i18next";

import React, { useState, FC, useEffect, ReactNode } from "react";
import { Button, Link, Input, Grid, Spacer, Tooltip, Select } from "@geist-ui/react";
import ReactHtmlParser from "react-html-parser";
import { withStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import { Connection } from "../../containers/Connection";
import { formatEther, formatUnits, parseEther } from "ethers/lib/utils";
import { Contracts } from "../../containers/Contracts";
import { ERC20Transfer } from "../../containers/Erc20Transfer";
import Collapse from "../Collapsible/Collapse";
import { LpIcon, TokenIcon, MiniIcon } from "../../components/TokenIcon";
import { useDill } from "../../containers/Dill";
import { backgroundColor, pickleGreen } from "../../util/constants";
import { Gauge__factory as GaugeFactory } from "../../containers/Contracts/factories/Gauge__factory";
import { getProtocolData } from "../../util/api";
import { getFormatString } from "./GaugeInfo";
import { uncompoundAPY } from "../../util/jars";
import { UserGaugeDataWithAPY } from "./GaugeList";
import { useButtonStatus, ButtonStatus } from "v1/hooks/useButtonStatus";
import { Balances } from "v1/containers/Balances";
import { TokenInput } from "./TokenInput";
import { PickleCore } from "../../containers/Jars/usePickleCore";
import { UserJarData } from "v1/containers/UserJars";

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

const StyledApprove = styled(Button)({
  lineHeight: "inherit",
  right: "550%",
  height: "1.5rem",
  minWidth: "6.5rem",
});

const formatAPY = (apy: number) => {
  if (apy === Number.POSITIVE_INFINITY) return "∞%";
  return apy.toFixed(2) + "%";
};

export const toNum = (bn: BigNumber, decimals: number = 18) =>
  parseFloat(formatUnits(bn ? bn : BigNumber.from(0), decimals));

export const formatValue = (num: number) =>
  num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: num < 1 ? 6 : 4,
  });

export const JAR_DEPOSIT_TOKEN_TO_ICON: {
  [key: string]: string | ReactNode;
} = {
  "0x94981F69F7483AF3ae218CbfE65233cC3c60d93a": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/rbn.png"} />
  ),
  // FRAX/DAI 0.05%
  "0x97e7d56A0408570bA1a7852De36350f7713906ec": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/frax.webp"} />
  ),
  // FRAX/USDC 0.05%
  "0xc63B0708E2F7e69CB8A1df0e1389A98C35A76D52": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/frax.webp"} />
  ),
  // USDC/WETH 0.05%
  "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/tokens/usdc.png"} />
  ),
  // LOOKS/ETH 0.3%
  "0x4b5Ab61593A2401B1075b90c04cBCDD3F87CE011": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/tokens/looks.png"} />
  ),
  // USDC/USDT 0.01%
  "0x3416cF6C708Da44DB2624D63ea0AAef7113527C6": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/usdcusdt.png"} />
  ),
  // WBTC/WETH 0.05%
  "0x4585FE77225b41b697C938B018E2Ac67Ac5a20c0": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/tokens/wbtc.png"} />
  ),
  // PICKLE/WETH 1%
  "0x11c4D3b9cd07807F455371d56B3899bBaE662788": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/tokens/pickle.png"} />
  ),
  // PICKLE/WETH 1%
  "0xFCfDFC98062d13a11cec48c44E4613eB26a34293": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/tokens/cow.png"} />
  ),
  // APE/WETH 0.3%
  "0xAc4b3DacB91461209Ae9d41EC517c2B9Cb1B7DAF": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/tokens/apecoin.png"} />
  ),
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const GreenSwitch = withStyles({
  switchBase: {
    color: backgroundColor,
    "&$checked": {
      color: pickleGreen,
    },
    "&$checked + $track": {
      backgroundColor: pickleGreen,
    },
  },
  checked: {},
  track: {},
})(Switch);

export const UniV3JarGaugeCollapsible: FC<{
  jarData: UserJarData;
  gaugeData: UserGaugeDataWithAPY;
  isFrax: boolean;
}> = ({ jarData, gaugeData, isFrax }) => {
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
    token0,
    token1,
    proportion,
    supply,
  } = jarData;

  const [useEth, setUseEth] = useState<boolean>(false);

  enum ethToken {
    none,
    token0,
    token1,
  }

  //TODO get wrapped native token dynamically based on current chain
  const weth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const isEthToken =
    token0?.address.toLowerCase() === weth.toLowerCase()
      ? ethToken.token0
      : token1?.address.toLowerCase() === weth.toLowerCase()
      ? ethToken.token1
      : ethToken.none;

  const depositBuilder = () => {
    if (useEth) return defaultDeposit();
    else {
      switch (isEthToken) {
        case ethToken.token0:
          return jarContract
            .connect(signer)
            [`deposit(uint256,uint256${!isFrax ? ",bool" : ""})`](
              "0",
              convertDecimals(deposit1Amount, token1?.decimals),
              ...(isFrax ? [] : [shouldZap]),
              {
                value: parseEther(deposit0Amount),
                gasLimit: 850000,
              },
            );
        case ethToken.token1:
          return jarContract
            .connect(signer)
            [`deposit(uint256,uint256${!isFrax ? ",bool" : ""})`](
              convertDecimals(deposit0Amount, token0?.decimals),
              "0",
              ...(isFrax ? [] : [shouldZap]),
              {
                value: parseEther(deposit1Amount),
                gasLimit: 850000,
              },
            );
        case ethToken.none:
        default:
          return defaultDeposit();
      }
    }
  };

  const defaultDeposit = () =>
    jarContract
      .connect(signer)
      [`deposit(uint256,uint256${!isFrax ? ",bool" : ""})`](
        convertDecimals(deposit0Amount, token0?.decimals),
        convertDecimals(deposit1Amount, token1?.decimals),
        ...(isFrax ? [] : [shouldZap]),
        { gasLimit: 850000 },
      );

  const { balance: dillBalance, totalSupply: dillSupply } = useDill();
  const { t } = useTranslation("common");
  const { setButtonStatus } = useButtonStatus();
  const { pickleCore } = PickleCore.useContainer();

  const depositedNum = parseFloat(formatEther(deposited));

  const depositedStr = formatValue(depositedNum);

  const {
    depositToken: gaugeDepositToken,
    balance: gaugeBalance,
    staked,
    harvestable,
    depositTokenName: gaugeDepositTokenName,
    fullApy,
    uncompounded,
  } = gaugeData;

  const stakedNum = parseFloat(formatEther(staked));

  const valueStr = (usdPerPToken * (depositedNum + stakedNum)).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const pickleAPYMin = fullApy * 100 * 0.4;
  const pickleAPYMax = fullApy * 100;

  const dillRatio = +(dillSupply?.toString() || 0)
    ? +(dillBalance?.toString() || 0) / +(dillSupply?.toString() || 1)
    : 0;

  const _balance = stakedNum;
  const _derived = _balance * 0.4;
  const _adjusted = (gaugeData.totalSupply / 1e18) * dillRatio * 0.6;

  const pickleAPY = (pickleAPYMax * Math.min(_balance, _derived + _adjusted)) / _balance;

  const realAPY = totalAPY + pickleAPY;

  const multiplier = pickleCore?.assets.jars.find(
    (x) => x.depositToken.addr.toLowerCase() === depositToken.address.toLowerCase(),
  )?.details?.harvestStats?.multiplier;

  const totalAPY1: number = APYs.map((x) => {
    return Object.values(x)
      .filter((x) => !isNaN(x))
      .reduce((acc, y) => acc + y, 0);
  }).reduce((acc, x) => acc + x, 0);
  const totalAPR1: number = uncompounded
    .map((x) => {
      return Object.values(x)
        .filter((x) => !isNaN(x))
        .reduce((acc, y) => acc + y, 0);
    })
    .reduce((acc, x) => acc + x, 0);
  const difference = totalAPY1 - totalAPR1;

  const apyRangeTooltipText = [
    `${t("farms.baseAPRs")}:`,
    `pickle: ${formatAPY(pickleAPYMin)} ~ ${formatAPY(pickleAPYMax)}`,
    ...APYs.map((x) => {
      const k = Object.keys(x)[0];
      const v = uncompoundAPY(Object.values(x)[0]);
      return isNaN(v) || v > 1e6 ? null : `${k}: ${v.toFixed(2)}%`;
    }),
    ...(multiplier ? [`${t("frax.multiplier")}: ${multiplier.toFixed(1)}x`] : []),
    `${t(
      "farms.compounding",
    )} <img src="/magicwand.svg" height="16" width="16"/>: ${difference.toFixed(2)}%`,
  ]
    .filter((x) => x)
    .join(` <br/> `);

  const yourApyTooltipText = [
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

  const [deposit0Amount, setDeposit0Amount] = useState("0");
  const [deposit1Amount, setDeposit1Amount] = useState("0");
  const [shouldZap, setShouldZap] = useState<boolean>(isFrax ? false : true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [tvlData, setTVLData] = useState();
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

  const {
    status: erc20TransferStatuses,
    transfer,
    getTransferStatus,
  } = ERC20Transfer.useContainer();
  const { signer, address, blockNum } = Connection.useContainer();
  const { tokenBalances, getBalance } = Balances.useContainer();

  const gauge = signer && GaugeFactory.connect(gaugeData.address, signer);

  const stakedStr = formatValue(stakedNum);

  const harvestableNum = parseFloat(formatEther(harvestable || 0));

  const harvestableStr = parseFloat(formatEther(harvestable || 0)).toLocaleString();

  const balanceNum = parseFloat(formatEther(balance));

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

  const depositGauge = async () => {
    if (!approved && erc20) {
      setDepositStakeButton(t("farms.approving"));
      const Token = erc20.attach(gaugeDepositToken.address).connect(signer);
      const tx = await Token.approve(gaugeData.address, ethers.constants.MaxUint256);
      await tx.wait();
    }
    setDepositStakeButton(t("farms.staking"));
    const gaugeTx = await gauge.depositAll();
    await gaugeTx.wait();
  };

  const depositAndStake = async () => {
    if (token0?.walletBalance) {
      try {
        setIsEntryBatch(true);
        const res = await transfer({
          token: depositToken.address,
          recipient: jarContract.address,
          transferCallback: async () => {
            return depositBuilder();
          },
          approval: false,
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

  const convertDecimals = (num: string, decimals: number | undefined) =>
    ethers.utils.parseUnits(num, decimals || 18);

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
  }, [erc20TransferStatuses, jarData, tokenBalances, blockNum, address]);
  const { erc20 } = Contracts.useContainer();
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    getProtocolData().then((info) => setTVLData(info));
  }, []);

  const tvlJarData = pickleCore?.assets.jars.filter(
    (x) => x.depositToken.addr.toLowerCase() === depositToken.address.toLowerCase(),
  )[0];
  const tvlNum =
    tvlJarData && tvlJarData.details?.harvestStats
      ? tvlJarData.details?.harvestStats.balanceUSD
      : 0;
  const tvlStr = getFormatString(tvlNum);

  if (!token0 || !token1) return <> </>;
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
            </>
          </Grid>
          <Grid xs={24} sm={24} md={4} lg={4} css={{ textAlign: "center" }}>
            {!gaugeData ? (
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
          <TokenInput
            token={token0}
            otherToken={token1}
            isToken0={true}
            setDepositThisAmount={setDeposit0Amount}
            setDepositOtherAmount={setDeposit1Amount}
            proportion={proportion!}
            depositAmount={deposit0Amount}
            jarAddr={jarContract.address}
            setUseEth={setUseEth}
            shouldZap={shouldZap}
            isFrax={isFrax}
          />
          <TokenInput
            token={token1}
            otherToken={token0}
            isToken0={false}
            setDepositThisAmount={setDeposit1Amount}
            setDepositOtherAmount={setDeposit0Amount}
            proportion={proportion!}
            depositAmount={deposit1Amount}
            jarAddr={jarContract.address}
            setUseEth={setUseEth}
            shouldZap={shouldZap}
            isFrax={isFrax}
          />
          {!isFrax && (
            <>
              <GreenSwitch checked={shouldZap} onChange={() => setShouldZap(!shouldZap)} />
              {t("farms.shouldZap")}
            </>
          )}
          <Grid.Container gap={1}>
            <Grid xs={24} md={12}>
              <Button
                onClick={() => {
                  if (signer) {
                    transfer({
                      token: depositToken.address,
                      recipient: jarContract.address,
                      transferCallback: async () => {
                        return depositBuilder();
                      },
                      approval: false,
                    });
                  }
                }}
                disabled={depositButton.disabled}
                style={{ width: "100%" }}
              >
                {depositButton.text}
              </Button>
            </Grid>
            <Grid xs={24} md={12}>
              <Button
                onClick={depositAndStake}
                disabled={Boolean(depositStakeButton) || depositButton.disabled}
                style={{ width: "100%" }}
              >
                {isEntryBatch
                  ? depositStakeButton || depositButton.text
                  : t("farms.depositAndStake")}
              </Button>
            </Grid>
          </Grid.Container>
        </Grid>
        {depositedNum !== 0 && (!isEntryBatch || stakedNum) && (
          <Grid xs={24} md={12} style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "auto",
              }}
            >
              <div>{`${t("balances.balance")}: ${depositedStr} p${depositTokenName}`}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                {`(${formatValue(
                  (depositedNum * token0.jarAmount * ratio) / supply,
                )} ${token0.name.toUpperCase()}, ${formatValue(
                  (depositedNum * token1.jarAmount * ratio) / supply,
                )} ${token1.name.toUpperCase()})`}
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
                        .withdraw(convertDecimals(withdrawAmount, 18));
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
                disabled={stakeButton.disabled}
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
                  {t("balances.staked")}: {stakedStr} {gaugeDepositTokenName}
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
                          return convertDecimals(unstakeAmount, 18).eq(staked)
                            ? gauge.exit()
                            : gauge.withdraw(convertDecimals(unstakeAmount, 18));
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
