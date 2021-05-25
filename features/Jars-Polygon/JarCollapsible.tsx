import { ethers } from "ethers";
import styled from "styled-components";

import { useState, FC, useEffect, ReactNode } from "react";
import { Button, Link, Input, Grid, Spacer, Tooltip } from "@geist-ui/react";

import { Connection } from "../../containers/Connection";
import { formatEther } from "ethers/lib/utils";
import {
  ERC20Transfer,
  Status as ERC20TransferStatus,
} from "../../containers/Erc20Transfer";
import Collapse from "../Collapsible/Collapse";
import { UserJarData } from "../../containers/UserJars";
import { LpIcon, TokenIcon } from "../../components/TokenIcon";
import { JAR_DEPOSIT_TOKENS } from "../../containers/Jars-Ethereum/jars";

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

export const JAR_DEPOSIT_TOKEN_TO_ICON: {
  [key: string]: string | ReactNode;
} = {
  "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063": "/dai.png",
  "0x1Edb2D8f791D2a51D56979bf3A25673D6E783232": (
    <LpIcon swapIconSrc={"/comethswap.png"} tokenIconSrc={"/usdc.png"} />
  ),
  "0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171": "/3crv.png",
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

export const JarCollapsible: FC<{ jarData: UserJarData }> = ({ jarData }) => {
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

  const balNum = parseFloat(formatEther(balance));
  const depositedNum = parseFloat(formatEther(deposited));
  const balStr = balNum.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: balNum < 1 ? 18 : 4,
  });
  const depositedStr = depositedNum.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: depositedNum < 1 ? 18 : 4,
  });
  const depositedUnderlyingStr = (
    parseFloat(formatEther(deposited)) * ratio
  ).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: depositedNum < 1 ? 18 : 4,
  });
  const valueStr = (usdPerPToken * depositedNum).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

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
  const { signer } = Connection.useContainer();

  useEffect(() => {
    const dStatus = getTransferStatus(
      depositToken.address,
      jarContract.address,
    );
    const wStatus = getTransferStatus(jarContract.address, jarContract.address);

    setButtonStatus(dStatus, "Depositing...", "Deposit", setDepositButton);
    setButtonStatus(wStatus, "Withdrawing...", "Withdraw", setWithdrawButton);
  }, [erc20TransferStatuses]);

  const tooltipText = APYs.map((x) => {
    const k = Object.keys(x)[0];
    const v = Object.values(x)[0];
    return `${k}: ${v.toFixed(2)}%`;
  }).join(" + ");

  return (
    <Collapse
      style={{ borderWidth: "1px", boxShadow: "none" }}
      shadow
      preview={
        <Grid.Container gap={1}>
          <JarName xs={24} sm={12} md={5} lg={5}>
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
          <Grid xs={24} sm={12} md={4} lg={4}>
            <Data>
              <Tooltip text={tooltipText}>
                {totalAPY.toFixed(2) + "%" || "--"}
              </Tooltip>
            </Data>
            <Data>
              <Tooltip
                text={`This yield is calculated in real time from a base rate of ${apr.toFixed(
                  2,
                )}% which we auto-compound regularly.`}
              >
                <div style={{ display: "flex", marginTop: 5 }}>
                  <span>APY</span>
                  <img
                    src="./question.svg"
                    width="15px"
                    style={{ marginLeft: 5 }}
                  />
                </div>
              </Tooltip>
            </Data>
          </Grid>
          <Grid xs={24} sm={8} md={5} lg={5}>
            <Data isZero={balNum === 0}>{balStr}</Data>
            <Label>Balance</Label>
          </Grid>
          <Grid xs={24} sm={8} md={5} lg={5}>
            <Data isZero={depositedNum === 0}>{depositedStr}</Data>
            <Label>Deposited</Label>
          </Grid>
          <Grid xs={24} sm={8} md={5} lg={5}>
            <Data isZero={usdPerPToken * depositedNum === 0}>${valueStr}</Data>
            <Label>Value</Label>
          </Grid>
        </Grid.Container>
      }
    >
      <Spacer y={1} />
      <Grid.Container gap={2}>
        <Grid xs={24} md={12}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>Balance: {balStr}</div>
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
                      .deposit(ethers.utils.parseEther(depositAmount));
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
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              Balance {depositedStr} (
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
                      .withdraw(ethers.utils.parseEther(withdrawAmount));
                  },
                });
              }
            }}
            style={{ width: "100%" }}
          >
            {withdrawButton.text}
          </Button>
          <div
            style={{
              width: "100%",
              textAlign: "center",
              paddingTop: "4px",
              fontFamily: "Source Sans Pro",
            }}
          >
            There is no withdrawal fee
          </div>
        </Grid>
      </Grid.Container>
    </Collapse>
  );
};
