import { ethers } from "ethers";
import styled from "styled-components";

import { useState, FC, useEffect, ReactNode } from "react";
import { Button, Link, Input, Grid, Spacer, Tooltip } from "@geist-ui/react";
import ReactHtmlParser from "react-html-parser";

import { Connection } from "../../containers/Connection";
import { formatEther, parseEther } from "ethers/lib/utils";
import { Contracts } from "../../containers/Contracts";
import {
  ERC20Transfer,
  Status as ERC20TransferStatus,
} from "../../containers/Erc20Transfer";
import Collapse from "../Collapsible/Collapse";
import { UserJarData } from "../../containers/UserJars";
import { LpIcon, TokenIcon, MiniIcon } from "../../components/TokenIcon";
import { UserFarmDataMatic } from "../../containers/UserMiniFarms";
import { getProtocolData } from "../../util/api";
import { GAUGE_TVL_KEY, getFormatString } from "../Gauges/GaugeInfo";
import { JarApy } from "containers/Jars/useCurveCrvAPY";
import { Balances } from "../../containers/Balances";

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
};

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
    status === ERC20TransferStatus.Success ||
    status === ERC20TransferStatus.Failed ||
    status === ERC20TransferStatus.Cancelled
  ) {
    setButtonText({
      disabled: false,
      text: idle,
    });
  }
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
  } = jarData;

  const balNum = parseFloat(formatEther(balance));
  const depositedNum = parseFloat(formatEther(deposited));

  const balStr = formatNumber(balNum);

  const depositedStr = formatNumber(depositedNum);

  const depositedUnderlyingStr = formatNumber(
    parseFloat(formatEther(deposited)) * ratio,
  );

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

  const stakedNum = parseFloat(formatEther(staked));

  const valueStr = (usdPerPToken * (depositedNum + stakedNum)).toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [tvlData, setTVLData] = useState();
  const [isExitBatch, setIsExitBatch] = useState<Boolean>(false);
  const [isEntryBatch, setIsEntryBatch] = useState<Boolean>(false);

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
  const { minichef, jar } = Contracts.useContainer();
  const { getBalance } = Balances.useContainer();

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

  const [depositStakeButton, setDepositStakeButton] = useState<string | null>(
    null,
  );
  const [exitButton, setExitButton] = useState<string | null>(null);

  const depositAndStake = async () => {
    if (balNum && minichef && address) {
      try {
        setIsEntryBatch(true);
        const res = await transfer({
          token: depositToken.address,
          recipient: jarContract.address,
          transferCallback: async () => {
            return jarContract
              .connect(signer)
              .deposit(parseEther(depositAmount));
          },
        });
        if (!res) throw "Deposit Failed";
        const Token = jar?.attach(farmDepositToken.address).connect(signer);
        if (!approved) {
          setDepositStakeButton("Approving...");
          const tx = await Token.approve(
            minichef.address,
            ethers.constants.MaxUint256,
          );
          await tx.wait();
        }
        const realRatio = await Token.getRatio();
        setDepositStakeButton("Staking...");
        const newBalance = getStakeableBalance(realRatio);
        const farmTx = await minichef.deposit(poolIndex, newBalance, address);
        await farmTx.wait();
        await sleep(10000)
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
      .add(deposited);

  const exit = async () => {
    if (stakedNum && minichef && address) {
      try {
        setIsExitBatch(true);
        setExitButton("Unstaking from Farm...");
        const exitTx = await minichef.withdrawAndHarvest(
          poolIndex,
          staked,
          address,
        );
        await exitTx.wait();
        setExitButton("Withdrawing from Jar...");
        const withdrawTx = await jarContract.connect(signer).withdrawAll();
        await withdrawTx.wait();
        await sleep(10000)
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

      setButtonStatus(dStatus, "Depositing...", "Deposit", setDepositButton);
      setButtonStatus(wStatus, "Withdrawing...", "Withdraw", setWithdrawButton);
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
  }, [erc20TransferStatuses, jarData, depositedStr]);

  const { erc20 } = Contracts.useContainer();
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
          <Grid xs={24} sm={12} md={3} lg={3} css={{ textAlign: "center" }}>
            <Data isZero={balanceNum === 0}>{balanceStr}</Data>
            <br />
            <Label>Wallet Balance</Label>
          </Grid>
          <Grid xs={24} sm={12} md={4} lg={4} css={{ textAlign: "center" }}>
            <Data isZero={parseFloat(formatEther(harvestable || 0)) === 0}>
              {harvestableStr} <MiniIcon source={"/pickle.png"} />
              <br />
              {harvestableMaticStr} <MiniIcon source={"/matic.png"} />
            </Data>
            <Label>Earned</Label>
          </Grid>
          <Grid xs={24} sm={12} md={3} lg={3} css={{ textAlign: "center" }}>
            <>
              <Data isZero={+valueStr == 0}>${valueStr}</Data>
              <br />
              <Label>Deposit Value</Label>
            </>
          </Grid>
          <Grid xs={24} sm={24} md={4} lg={4} css={{ textAlign: "center" }}>
            <Data>
              <Tooltip text={ReactHtmlParser(tooltipText)}>
                {totalAPY.toFixed(2) + "%" || "--"}
              </Tooltip>
              <img
                src="./question.svg"
                width="15px"
                style={{ marginLeft: 5 }}
              />
              <div>
                <span>APY</span>
              </div>
            </Data>
          </Grid>
          <Grid xs={24} sm={12} md={4} lg={4} css={{ textAlign: "center" }}>
            <Data isZero={tvlNum === 0}>${tvlStr}</Data>
            <br />
            <Label>TVL</Label>
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
              Balance: {balStr} {depositTokenName}
            </div>
            <Link
              color
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setDepositAmount(formatEther(balance));
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
                  if (signer) {
                    // Allow Jar to get LP Token
                    transfer({
                      token: depositToken.address,
                      recipient: jarContract.address,
                      transferCallback: async () => {
                        return jarContract
                          .connect(signer)
                          .deposit(parseEther(depositAmount));
                      },
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
                  : "Deposit and Stake"}
              </Button>
            </Grid>
          </Grid.Container>
        </Grid>
        {depositedNum !== 0 && (!isEntryBatch || stakedNum) && (
          <Grid xs={24} md={12}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                Balance: {depositedStr} (
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
                  Staked: {stakedStr} {farmDepositTokenName}
                </div>
                <Link
                  color
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setUnstakeAmount(formatEther(staked));
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
                {exitButton || "Harvest and Exit"}
              </Button>
            </Grid>
          </>
        )}
      </Grid.Container>
    </Collapse>
  );
};
