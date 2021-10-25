import { BigNumber, ethers } from "ethers";
import styled from "styled-components";
import { Trans, useTranslation } from "next-i18next";

import { useState, FC, useEffect, ReactNode } from "react";
import { Button, Link, Input, Grid, Spacer, Tooltip } from "@geist-ui/react";
import ReactHtmlParser from "react-html-parser";

import { Connection } from "../../containers/Connection";
import { formatEther, parseEther } from "ethers/lib/utils";
import { Contracts } from "../../containers/Contracts";
import { ERC20Transfer } from "../../containers/Erc20Transfer";
import Collapse from "../Collapsible/Collapse";
import { UserJarData } from "../../containers/UserJars";
import { LpIcon, TokenIcon, MiniIcon } from "../../components/TokenIcon";
import { JAR_DEPOSIT_TOKENS } from "../../containers/Jars/jars";
import { useDill } from "../../containers/Dill";
import { Gauge__factory as GaugeFactory } from "../../containers/Contracts/factories/Gauge__factory";
import { getProtocolData } from "../../util/api";
import { GAUGE_TVL_KEY, getFormatString } from "./GaugeInfo";
import { jars, uncompoundAPY } from "../../util/jars";
import { JarApy, UserGaugeDataWithAPY } from "./GaugeList";
import { JarV3 } from "containers/Contracts/JarV3";
import { JarV3__factory as JarV3Factory } from "containers/Contracts/factories/JarV3__factory";
import { useButtonStatus, ButtonStatus } from "hooks/useButtonStatus";
import { getPoolData, getProportion, uniV3Info } from "../../util/univ3";
import { getPriceId } from "../../containers/Jars/jars";
import { Balances } from "containers/Balances";
import erc20 from "@studydefi/money-legos/erc20";

interface DataProps {
  isZero?: boolean;
}

interface UniV3 {
  address: string;
  name: string;
  balance: BigNumber;
  approved: boolean;
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

const toNum = (bn: BigNumber) =>
  parseFloat(formatEther(bn ? bn : BigNumber.from(0)));

const formatValue = (num: number) =>
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
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const getTokenName = (address: string) => {
  const name = getPriceId(address.toLowerCase());
  return name === "eth" ? "WETH" : name.toUpperCase();
};

const ApproveButton: FC<{
  depositTokenAddr: string;
  jarAddr: string;
  signer: any;
  approved: boolean;
  setToken: any;
}> = ({ depositTokenAddr, jarAddr, signer, approved, setToken }) => {
  const [buttonText, setButtonText] = useState("Approve");

  useEffect(() => {
    setButtonText(approved ? "Approved" : "Approve");
  }, [approved]);

  return (
    <Button
      style={{
        lineHeight: "inherit",
        right: "550%",
        height: "1.5rem",
        minWidth: "6.5rem",
      }}
      disabled={approved}
      onClick={async () => {
        const Token = new ethers.Contract(depositTokenAddr, erc20.abi, signer);
        const tx = await Token.approve(jarAddr, ethers.constants.MaxUint256);
        await tx.wait();
        setToken((prevState) => ({
          ...prevState,
          approved: true,
        }));
        setButtonText("Approved");
      }}
    >
      {buttonText}
    </Button>
  );
};

export const UniV3JarGaugeCollapsible: FC<{
  jarData: UserJarData;
  gaugeData: UserGaugeDataWithAPY;
}> = ({ jarData, gaugeData }) => {
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
  } = jarData;

  const { balance: dillBalance, totalSupply: dillSupply } = useDill();
  const { t } = useTranslation("common");
  const { setButtonStatus } = useButtonStatus();

  const balNum = parseFloat(formatEther(balance));
  const depositedNum = parseFloat(formatEther(deposited));

  const depositedStr = formatValue(depositedNum);

  const depositedUnderlyingStr = formatValue(
    parseFloat(formatEther(deposited)) * ratio,
  );

  // Placeholder data
  const gaugeDepositToken = jarContract;
  const gaugeBalance = BigNumber.from(0);
  const staked = BigNumber.from(0);
  const harvestable = BigNumber.from(0);
  const gaugeDepositTokenName = "asdf";
  const fullApy = 0;
  const uncompounded = [];
  const gaugeAddress = "0x08cb0a0ba8e4f143e4e6f7bed65e02b6dfb9a16c";

  const stakedNum = parseFloat(formatEther(staked));

  const valueStr = (usdPerPToken * (depositedNum + stakedNum)).toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );

  const pickleAPYMin = fullApy * 100 * 0.4;
  const pickleAPYMax = fullApy * 100;

  const dillRatio = +(dillSupply?.toString() || 0)
    ? +(dillBalance?.toString() || 0) / +(dillSupply?.toString() || 1)
    : 0;

  const _balance = stakedNum;
  const _derived = _balance * 0.4;
  const _adjusted = (gaugeData.totalSupply / 1e18) * dillRatio * 0.6;

  const pickleAPY =
    (pickleAPYMax * Math.min(_balance, _derived + _adjusted)) / _balance;

  const realAPY = totalAPY + pickleAPY;

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
    `${t(
      "farms.compounding",
    )} <img src="/magicwand.svg" height="16" width="16"/>: ${difference.toFixed(
      2,
    )}%`,
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

  const [deposit0Amount, setDeposit0Amount] = useState("");
  const [deposit1Amount, setDeposit1Amount] = useState("");
  const [proportion, setProportion] = useState(BigNumber.from(0));
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

  const gauge = signer && GaugeFactory.connect(gaugeAddress, signer);

  const stakedStr = formatValue(stakedNum);

  const harvestableNum = parseFloat(formatEther(harvestable || 0));

  const harvestableStr = parseFloat(
    formatEther(harvestable || 0),
  ).toLocaleString();

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

  const [depositStakeButton, setDepositStakeButton] = useState<string | null>(
    null,
  );
  const [exitButton, setExitButton] = useState<string | null>(null);

  // Uni v3 specific
  const [jarV3, setJarV3] = useState<JarV3 | null>(null);
  const [token0, setToken0] = useState<UniV3 | null>(null);

  const [token1, setToken1] = useState<UniV3 | null>(null);

  const depositGauge = async () => {
    if (!approved) {
      setDepositStakeButton(t("farms.approving"));
      const Token = erc20?.attach(gaugeDepositToken.address).connect(signer);
      const tx = await Token.approve(gaugeAddress, ethers.constants.MaxUint256);
      await tx.wait();
    }
    setDepositStakeButton(t("farms.staking"));
    const gaugeTx = await gauge.depositAll();
    await gaugeTx.wait();
  };

  const depositAndStake = async () => {
    if (balNum) {
      try {
        setIsEntryBatch(true);
        const res = await transfer({
          token: depositToken.address,
          recipient: jarContract.address,
          transferCallback: async () => {
            return jarContract
              .connect(signer)
              .deposit(convertDecimals(depositAmount));
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

  const convertDecimals = (num: string) => ethers.utils.parseEther(num);
  const fetchUniV3 = async () => {
    if (signer && erc20 && address) {
      const { incentiveKey } = uniV3Info[
        depositToken.address as keyof typeof uniV3Info
      ];

      const data = await getPoolData(incentiveKey[1], incentiveKey[0], signer);
      const [bal0, bal1, proportion] = await Promise.all([
        getBalance(data.token0),
        getBalance(data.token1),
        getProportion(jarContract.address, signer),
      ]);
      setProportion(proportion);

      // Check token approvals
      const Token0 = erc20.attach(data.token0).connect(signer);
      const Token1 = erc20.attach(data.token1).connect(signer);
      const allowance0 = await Token0.allowance(address, jarContract.address);
      const allowance1 = await Token1.allowance(address, jarContract.address);

      const jarV3 = JarV3Factory.connect(jarContract.address, signer);
      setJarV3(jarV3);
      setToken0({
        address: data.token0,
        name: getTokenName(data.token0),
        balance: bal0,
        approved: allowance0.gt(ethers.constants.Zero),
      });
      setToken1({
        address: data.token1,
        name: getTokenName(data.token1),
        balance: bal1,
        approved: allowance1.gt(ethers.constants.Zero),
      });
    }
  };

  useEffect(() => {
    fetchUniV3();
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
    if (gaugeData && !isExitBatch) {
      const stakeStatus = getTransferStatus(
        gaugeDepositToken.address,
        gaugeAddress,
      );
      const unstakeStatus = getTransferStatus(
        gaugeAddress,
        gaugeDepositToken.address,
      );
      const harvestStatus = getTransferStatus(gaugeAddress, "harvest");
      const exitStatus = getTransferStatus(gaugeAddress, "exit");

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
  }, [erc20TransferStatuses, jarData, tokenBalances, blockNum, address]);
  const { erc20 } = Contracts.useContainer();
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    getProtocolData().then((info) => setTVLData(info));
  }, []);

  const tvlNum =
    tvlData &&
    GAUGE_TVL_KEY[depositToken.address] &&
    tvlData[GAUGE_TVL_KEY[depositToken.address]]
      ? tvlData[GAUGE_TVL_KEY[depositToken.address]]
      : 0;
  const tvlStr = getFormatString(tvlNum);

  if (!token0 || !token1 || !jarV3 || Boolean(!proportion.toString())) return <> </>;
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
          <Grid xs={24} sm={12} md={3} lg={3} css={{ textAlign: "center" }}>
            <Data isZero={balanceNum === 0}>{balanceStr}</Data>
            <Label>{t("balances.walletBalance")}</Label>
          </Grid>
          <Grid xs={24} sm={12} md={3} lg={3} css={{ textAlign: "center" }}>
            <Data isZero={harvestableNum === 0}>
              {harvestableStr}{" "}
              {Boolean(harvestableNum) && <MiniIcon source={"/pickle.png"} />}
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
                <img
                  src="./question.svg"
                  width="15px"
                  style={{ marginLeft: 5 }}
                />
                <div>
                  <span>{t("balances.APY")}</span>
                </div>
              </Data>
            ) : (
              <div>
                <div>
                  <Tooltip
                    text={
                      totalAPY + fullApy === 0 ? (
                        "--"
                      ) : (
                        <>{ReactHtmlParser(apyRangeTooltipText)}</>
                      )
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
                      <img
                        src="./question.svg"
                        width="15px"
                        style={{ marginLeft: 5 }}
                      />
                    </div>
                    <Label>{t("balances.apyRange")}</Label>
                  </Tooltip>
                </div>
                {Boolean(realAPY) && (
                  <div>
                    <Tooltip
                      text={
                        realAPY === 0
                          ? "--"
                          : ReactHtmlParser(yourApyTooltipText)
                      }
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
        <Grid
          xs={24}
          md={depositedNum && (!isEntryBatch || stakedNum) ? 12 : 24}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              {t("balances.balance")}: {formatValue(toNum(token0?.balance))}{" "}
              {token0?.name}
            </div>
            <Link
              color
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setDeposit0Amount(formatEther(token0?.balance));
                setDeposit1Amount(
                  formatEther(
                    token0?.balance.mul(proportion).div(parseEther("1")),
                  ),
                );
              }}
            >
              {t("balances.max")}
            </Link>
          </div>
          <Input
            onChange={(e) => {
              setDeposit0Amount(e.target.value);
              setDeposit1Amount(
                formatEther(
                  parseEther(e.target.value)
                    .mul(proportion)
                    .div(parseEther("1")),
                ),
              );
            }}
            value={deposit0Amount}
            width="100%"
            iconRight={
              <ApproveButton
                depositTokenAddr={token0.address}
                jarAddr={jarContract.address}
                signer={signer}
                approved={token0.approved}
                setToken={setToken0}
              />
            }
          />
          <Spacer y={0.5} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              {t("balances.balance")}: {formatValue(toNum(token1?.balance))}{" "}
              {token1?.name}
            </div>
            <Link
              color
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setDeposit1Amount(formatEther(token1?.balance));
                setDeposit0Amount(
                  formatEther(
                    token1?.balance.mul(parseEther("1")).div(proportion),
                  ),
                );
              }}
            >
              {t("balances.max")}
            </Link>
          </div>
          <Input
            onChange={(e) => {
              setDeposit1Amount(e.target.value);
              setDeposit0Amount(
                formatEther(
                  parseEther(e.target.value)
                    .mul(parseEther("1"))
                    .div(proportion),
                ),
              );
            }}
            value={deposit1Amount}
            width="100%"
            iconRight={
              <ApproveButton
                depositTokenAddr={token1.address}
                jarAddr={jarContract.address}
                signer={signer}
                approved={token1.approved}
                setToken={setToken0}
              />
            }
          />

          <Spacer y={0.5} />
          <Grid.Container gap={1}>
            <Grid xs={24} md={12}>
              <Button
                onClick={() => {
                  if (signer) {
                    // Allow Jar to get LP Token
                    transfer({
                      token: depositToken.address,
                      recipient: jarV3.address,
                      transferCallback: async () => {
                        return jarV3
                          .connect(signer)
                          .deposit(
                            convertDecimals(deposit0Amount),
                            convertDecimals(deposit1Amount),
                          );
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
          <Grid
            xs={24}
            md={12}
            style={{ display: "flex", flexDirection: "column" }}
          >
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
                        .withdraw(convertDecimals(withdrawAmount));
                    },
                    approval: false,
                  });
                }
              }}
              style={{ width: "100%", marginTop: "auto" }}
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
            <Grid
              xs={24}
              md={(depositedNum && !stakedNum) || isEntryBatch ? 24 : 12}
            >
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
              md={
                (!depositedNum || isEntryBatch || isExitBatch) && stakedNum
                  ? 24
                  : 12
              }
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
