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
              if (signer) {
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
            disabled={depositButton.disabled || depositTokenName === "DAI"}
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
