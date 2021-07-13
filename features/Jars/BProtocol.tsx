import { ethers } from "ethers";
import { formatEther } from "ethers/lib/utils";
import styled from "styled-components";

import { useState, FC, useEffect, ReactNode } from "react";
import Collapse from "../Collapsible/Collapse";
import {
  ERC20Transfer,
  Status as ERC20TransferStatus,
} from "../../containers/Erc20Transfer";
import { Connection } from "../../containers/Connection";
import { Balances } from "../../containers/Balances";
import { LpIcon, TokenIcon } from "../../components/TokenIcon";
import { Button, Link, Input, Grid, Spacer, Tooltip } from "@geist-ui/react";
import { BPAddresses } from "containers/config";
import { Jar__factory as JarFactory } from "../../containers/Contracts/factories/Jar__factory";
import { Jar as JarContract } from "../../containers/Contracts/Jar";

const JarName = styled(Grid)({
  display: "flex",
});

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

const formatString = (num: number) =>
  num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: num < 1 ? 8 : 4,
  });

interface ButtonStatus {
  disabled: boolean;
  text: string;
}

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

export const BProtocol: FC = () => {
  const { tokenBalances, getBalance } = Balances.useContainer();
  const [lusdBalance, setLusdBalance] = useState<ethers.BigNumber>(
    ethers.BigNumber.from(0),
  );
  const [pbammBalance, setPbammBalance] = useState<ethers.BigNumber>(
    ethers.BigNumber.from(0),
  );
  const [contract, setContract] = useState<JarContract>();
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
  const { signer, provider } = Connection.useContainer();

  const updateBalance = async () => {
    const _lusd = await getBalance(BPAddresses.LUSD);
    const _pbamm = await getBalance(BPAddresses.pBAMM);
    if (_lusd) setLusdBalance(_lusd);
    if (_pbamm) setPbammBalance(_pbamm);
    setContract(JarFactory.connect(BPAddresses.pBAMM, provider));
  };

  const balNum = parseFloat(formatEther(lusdBalance));
  const balStr = formatString(balNum);
  const depositedNum = parseFloat(formatEther(pbammBalance));
  const depositedStr = formatString(depositedNum);
  const valueNum = 0;
  const valueStr = "0";

  useEffect(() => {
    updateBalance();
  }, [tokenBalances]);

  useEffect(() => {
    const dStatus = getTransferStatus(BPAddresses.LUSD, BPAddresses.pBAMM);
    const wStatus = getTransferStatus(BPAddresses.pBAMM, BPAddresses.pBAMM);

    setButtonStatus(dStatus, "Depositing...", "Deposit", setDepositButton);
    setButtonStatus(wStatus, "Withdrawing...", "Withdraw", setWithdrawButton);
  }, [erc20TransferStatuses]);

  return (
    <Collapse
      style={{ borderWidth: "1px", boxShadow: "none" }}
      shadow
      preview={
        <Grid.Container gap={1}>
          <JarName xs={24} sm={12} md={5} lg={5}>
            <TokenIcon src={"/bprotocol.png"} />
            <div style={{ width: "100%" }}>
              <div style={{ fontSize: `1rem` }}>B.Protocol</div>
              <a
                href={"https://app.bprotocol.org/app"}
                target="_"
                style={{ fontSize: `1rem` }}
              >
                B.Protocol LUSD Staking
              </a>
            </div>
          </JarName>
          <Grid xs={24} sm={12} md={5} lg={5}>
            <Data>
              <Tooltip text="tooltip text">--</Tooltip>
            </Data>
            <Data>
              <Tooltip
                text={`This jar deposits into B.Protocol's Stability Vault...`}
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
          <Grid xs={24} sm={8} md={4} lg={5}>
            <Data isZero={balNum === 0}>{balStr}</Data>
            <Label>Balance</Label>
          </Grid>
          <Grid xs={24} sm={8} md={4} lg={4}>
            <Data isZero={depositedNum === 0}>{depositedStr}</Data>
            <Label>Deposited</Label>
          </Grid>
          <Grid xs={24} sm={8} md={4} lg={4}>
            <Data isZero={depositedNum === 0}>${valueStr}</Data>
            <Label>Value</Label>
          </Grid>
        </Grid.Container>
      }
    >
      <Grid.Container gap={2}>
        <Grid xs={24} md={12}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>Balance: {balStr}</div>
            <Link
              color
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setDepositAmount(formatEther(lusdBalance));
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
                  token: BPAddresses.LUSD,
                  recipient: BPAddresses.pBAMM,
                  transferCallback: async () => {
                    return contract
                      .connect(signer)
                      .deposit(ethers.utils.parseEther(depositAmount));
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
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              Balance {depositedStr} (
              <Tooltip
                text={`${
                  depositedNum
                    ? parseFloat(formatEther(pbammBalance)) // TODO: GET FULL VALUE
                    : 0
                } LUSD`}
              >
                PBAMM
              </Tooltip>
              LUSD
            </div>
            <Link
              color
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setWithdrawAmount(formatEther(pbammBalance));
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
                  token: BPAddresses.LUSD,
                  recipient: BPAddresses.pBAMM,
                  transferCallback: async () => {
                    return contract
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
