import { BigNumber, ethers } from "ethers";
import styled from "styled-components";
import { Trans, useTranslation } from "next-i18next";

import React, { useState, FC, useEffect, ReactNode } from "react";
import { Button, Link, Input, Grid, Spacer, Tooltip, Select } from "@geist-ui/react";
import ReactHtmlParser from "react-html-parser";

import { Connection } from "../../containers/Connection";
import { formatEther, formatUnits, parseEther } from "ethers/lib/utils";
import { Contracts } from "../../containers/Contracts";
import { ERC20Transfer } from "../../containers/Erc20Transfer";
import Collapse from "../Collapsible/Collapse";
import { LpIcon, TokenIcon, MiniIcon } from "../../components/TokenIcon";
import { useButtonStatus, ButtonStatus } from "v1/hooks/useButtonStatus";
import { Balances } from "v1/containers/Balances";
import { TokenInput } from "./TokenInput";
import { UserFarmDataMatic } from "v1/containers/UserMiniFarms";
import { JarApy } from "v1/features/MiniFarms/MiniFarmList";
import { UserJarData } from "v1/containers/UserJars";
import { getFormatString } from "v1/features/Gauges/GaugeInfo";

interface DataProps {
  isZero?: boolean;
}

interface FarmDataWithAPY extends UserFarmDataMatic {
  APYs: JarApy[];
  totalAPY: number;
  tooltipText: string;
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

export const formatValue = (num: number) =>
  num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: num < 1 ? 6 : 4,
  });

export const JAR_DEPOSIT_TOKEN_TO_ICON: {
  [key: string]: string | ReactNode;
} = {
  "0x45dDa9cb7c25131DF268515131f647d726f50608": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/ethusdc.png"} />
  ),
  "0x167384319B41F7094e62f7506409Eb38079AbfF8": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/maticweth.png"} />
  ),
  "0x88f3C15523544835fF6c738DDb30995339AD57d6": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/maticusdc.png"} />
  ),
  "0x3F5228d0e7D75467366be7De2c31D0d098bA2C23": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/usdcusdt.png"} />
  ),
  "0x50eaEDB835021E4A108B7290636d62E9765cc6d7": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/ethbtc.png"} />
  ),
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const UniV3JarMiniFarmCollapsible: FC<{
  jarData: UserJarData;
  farmData: FarmDataWithAPY;
}> = ({ jarData, farmData }) => {
  if (!jarData || !farmData) return <></>;
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
    token0,
    token1,
    proportion,
    tvlUSD,
    supply,
  } = jarData;

  const { t } = useTranslation("common");
  const { setButtonStatus } = useButtonStatus();

  // Farm info
  const {
    depositToken: farmDepositToken,
    balance: farmBalance,
    staked,
    harvestable,
    depositTokenName: farmDepositTokenName,
    poolIndex,
    tooltipText,
    totalAPY,
  } = farmData;

  const depositedNum = parseFloat(formatEther(deposited));

  const depositedStr = formatValue(depositedNum);

  const stakedNum = parseFloat(formatEther(staked));

  const totalNum = parseFloat(
    formatEther((deposited || BigNumber.from("0")).add(staked || BigNumber.from("0)"))),
  );

  const valueStr = (usdPerPToken * totalNum).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const [deposit0Amount, setDeposit0Amount] = useState("0");
  const [deposit1Amount, setDeposit1Amount] = useState("0");
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

  const {
    status: erc20TransferStatuses,
    transfer,
    getTransferStatus,
  } = ERC20Transfer.useContainer();
  const { signer, address, blockNum } = Connection.useContainer();
  const { tokenBalances, getBalance } = Balances.useContainer();

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
  const [useEth, setUseEth] = useState<boolean>(false);

  enum ethToken {
    none,
    token0,
    token1,
  }

  //TODO get wrapped native token dynamically based on current chain
  const weth = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";
  const isEthToken =
    token0?.address.toLowerCase() === weth
      ? ethToken.token0
      : token1?.address.toLowerCase() === weth
      ? ethToken.token1
      : ethToken.none;

  const depositBuilder = () => {
    if (useEth) return defaultDeposit();
    else {
      switch (isEthToken) {
        case ethToken.token0:
          return payableDeposit(
            0,
            convertDecimals(deposit1Amount, token1?.decimals ?? 18),
            parseEther(deposit0Amount),
          );
        case ethToken.token1:
          return payableDeposit(
            convertDecimals(deposit0Amount, token0?.decimals ?? 18),
            0,
            parseEther(deposit1Amount),
          );
        case ethToken.none:
        default:
          return defaultDeposit();
      }
    }
  };

  const payableDeposit = (
    token0Amount: BigNumber | 0,
    token1Amount: BigNumber | 0,
    ethAmount: BigNumber,
  ) => {
    return jarContract.connect(signer)["deposit(uint256,uint256)"](token0Amount, token1Amount, {
      value: ethAmount,
      gasLimit: 850000,
    });
  };

  const defaultDeposit = () => {
    return jarContract
      .connect(signer)
      ["deposit(uint256,uint256)"](
        convertDecimals(deposit0Amount, token0?.decimals ?? 18),
        convertDecimals(deposit1Amount, token1?.decimals ?? 18),
        { gasLimit: 850000 },
      );
  };
  const depositAndStake = async () => {
    if (minichef && address) {
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
        const Token = jar?.attach(farmDepositToken.address).connect(signer);
        if (!approved) {
          setDepositStakeButton(t("farms.approving"));
          const tx = await Token.approve(minichef.address, ethers.constants.MaxUint256);
          await tx.wait();
        }
        setDepositStakeButton(t("farms.staking"));
        const newBalance = getStakeableBalance(res);
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
  // TODO use event to get pTokens returned to user
  const getStakeableBalance = (res: ethers.ContractReceipt) => {
    const pTokenAmount = res.logs.filter((x) => x.address === farmDepositToken.address)[0]?.data;
    return BigNumber.from(pTokenAmount);
  };

  const exit = async () => {
    if (stakedNum && minichef && address) {
      try {
        setIsExitBatch(true);
        setExitButton(t("farms.unstakingFromFarm"));
        const exitTx = await minichef.withdrawAndHarvest(poolIndex, staked, address);
        await exitTx.wait();
        setExitButton(t("farms.withdrawingFromJar"));
        const withdrawTx = await jarContract.connect(signer).withdrawAll({ gasLimit: 600000 });
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
  const convertDecimals = (num: string, decimals: number) => ethers.utils.parseUnits(num, decimals);

  useEffect(() => {
    if (jarData && !isExitBatch) {
      const dStatus = getTransferStatus(depositToken.address, jarContract.address);
      const wStatus = getTransferStatus(jarContract.address, jarContract.address);

      setButtonStatus(dStatus, t("farms.depositing"), t("farms.deposit"), setDepositButton);
      setButtonStatus(wStatus, t("farms.withdrawing"), t("farms.withdraw"), setWithdrawButton);
    }
    if (minichef && !isExitBatch) {
      const stakeStatus = getTransferStatus(farmDepositToken.address, minichef.address);
      const unstakeStatus = getTransferStatus(minichef.address, farmDepositToken.address);
      const harvestStatus = getTransferStatus(minichef.address, "harvest");
      const exitStatus = getTransferStatus(minichef.address, "exit");

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
  const { erc20, minichef, jar } = Contracts.useContainer();
  const [approved, setApproved] = useState(false);

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
          <Grid xs={24} sm={12} md={4} lg={4} css={{ textAlign: "center" }}>
            <Data isZero={harvestableNum === 0}>
              {harvestableStr} {Boolean(harvestableNum) && <MiniIcon source={"/pickle.png"} />}
            </Data>
            <Label>{t("balances.earned")}</Label>
          </Grid>
          <Grid xs={24} sm={12} md={5} lg={5} css={{ textAlign: "center" }}>
            <>
              <Data isZero={+valueStr == 0}>${valueStr}</Data>
              <Label>{t("balances.depositValue")}</Label>
            </>
          </Grid>
          <Grid xs={24} sm={24} md={5} lg={5} style={{ textAlign: "center" }}>
            <Data>
              <Tooltip text={ReactHtmlParser(tooltipText)}>
                {totalAPY.toFixed(2) + "%" || "--"}
              </Tooltip>
              <img src="/question.svg" width="15px" style={{ marginLeft: 5 }} />
              <div>
                <span>{t("balances.apy")}</span>
              </div>
            </Data>
          </Grid>
          <Grid xs={24} sm={12} md={4} lg={4} style={{ textAlign: "center" }}>
            <Data isZero={tvlUSD === 0}>${getFormatString(tvlUSD)}</Data>
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
            proportion={proportion!}
            depositAmount={deposit0Amount}
            jarAddr={jarContract.address}
            setUseEth={setUseEth}
          />
          <TokenInput
            token={token1}
            otherToken={token0}
            isToken0={false}
            setDepositThisAmount={setDeposit1Amount}
            proportion={proportion!}
            depositAmount={deposit1Amount}
            jarAddr={jarContract.address}
            setUseEth={setUseEth}
          />
          <Grid.Container gap={1}>
            <Grid xs={24} md={12}>
              <Button
                onClick={() => {
                  if (signer) {
                    // Allow Jar to get LP Token
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
                {!stakedNum &&
                  `(${formatValue(
                    (totalNum * token0.jarAmount) / supply,
                  )} ${token0.name.toUpperCase()}, ${formatValue(
                    (totalNum * token1.jarAmount) / supply,
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
                      return jarContract.connect(signer).withdraw(convertDecimals(withdrawAmount), {
                        gasLimit: 600000,
                      });
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
                  if (minichef && address) {
                    transfer({
                      token: farmDepositToken.address,
                      recipient: minichef.address,
                      approvalAmountRequired: farmBalance,
                      transferCallback: async () => {
                        return minichef.deposit(poolIndex, farmBalance, address);
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
                  {t("balances.staked")}: {stakedStr} p{farmDepositTokenName}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  {`(${formatValue(
                    (totalNum * token0.jarAmount) / supply,
                  )} ${token0.name.toUpperCase()}, ${formatValue(
                    (totalNum * token1.jarAmount) / supply,
                  )} ${token1.name.toUpperCase()})`}
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
            {Boolean(stakedNum) && (
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
