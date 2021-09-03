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
import { usePBAMM } from "../../containers/Jars/usePBAMM";
import { Contracts } from "../../containers/Contracts";
import { Prices } from "../../containers/Prices";
import { BPAddresses } from "containers/config";
import { Gauge__factory as GaugeFactory } from "../../containers/Contracts/factories/Gauge__factory";
import { LpIcon, TokenIcon } from "../../components/TokenIcon";
import { Button, Link, Input, Grid, Spacer, Tooltip } from "@geist-ui/react";
import { useDuneData } from "../../containers/Jars/useDuneData";
import { getFormatString } from "./GaugeInfo";

const JarName = styled(Grid)({
  display: "flex",
});

interface DataProps {
  isZero?: boolean;
}

const CenteredGrid = styled(Grid)({
  textAlign: "center",
});

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
  } else if (status === ERC20TransferStatus.Transfering) {
    setButtonText({
      disabled: true,
      text: transfering,
    });
  } else {
    setButtonText({
      disabled: false,
      text: idle,
    });
  }
};

export const BProtocol: FC = () => {
  const {
    status: erc20TransferStatuses,
    transfer,
    getTransferStatus,
  } = ERC20Transfer.useContainer();
  const { pBAMM: pBAMMContract } = Contracts.useContainer();
  const { signer, provider } = Connection.useContainer();
  const { prices } = Prices.useContainer();
  const {
    pbammBalance,
    lusdBalance,
    plqtyBalance,
    userValue,
    lqtyApr,
    userPendingLqty,
    tvl
  } = usePBAMM();
  const { duneData } = useDuneData();

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const gauge = signer && GaugeFactory.connect(BPAddresses.LQTY_GAUGE, signer);

  const balNum = parseFloat(formatEther(lusdBalance));
  const balStr = formatString(balNum);
  const depositedNum = parseFloat(formatEther(pbammBalance));
  const depositedStr = formatString(depositedNum);
  const valueStr = formatString(userValue);
  const plqtyStr = formatString(+formatEther(plqtyBalance));
  const pendingLqtyNum = +formatEther(userPendingLqty);
  const pendingLqtyStr = formatString(pendingLqtyNum);
  const liquidationApy =
    duneData?.data?.get_result_by_result_id[0].data?.apr / 100;

  const [depositButton, setDepositButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Deposit",
  });
  const [withdrawButton, setWithdrawButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Withdraw",
  });
  const [stakeButton, setStakeButton] = useState<ButtonStatus>({
    disabled: false,
    text: `Stake Unstaked ${plqtyStr} Tokens in Farm`,
  });

  useEffect(() => {
    const dStatus = getTransferStatus(BPAddresses.LUSD, BPAddresses.pBAMM);
    const wStatus = getTransferStatus(BPAddresses.pBAMM, BPAddresses.pBAMM);
    const stakeStatus = getTransferStatus(
      BPAddresses.pLQTY,
      BPAddresses.LQTY_GAUGE,
    );

    setButtonStatus(dStatus, "Depositing...", "Deposit", setDepositButton);
    setButtonStatus(wStatus, "Withdrawing...", "Withdraw", setWithdrawButton);
    setButtonStatus(
      stakeStatus,
      "Staking...",
      `Stake Unstaked ${plqtyStr} pLQTY Tokens in Farm`,
      setStakeButton,
    );
  }, [erc20TransferStatuses, plqtyBalance]);

  if (!pBAMMContract) return <> </>;
  return (
    <Collapse
      style={{ borderWidth: "1px", boxShadow: "none" }}
      shadow
      preview={
        <Grid.Container gap={1}>
          <JarName xs={24} sm={12} md={6} lg={6}>
            <a href="https://app.bprotocol.org/app" target="_">
              <TokenIcon src={"/bprotocol.png"} />
            </a>
            <div style={{ width: "100%" }}>
              <div style={{ fontSize: `1rem` }}>B.Protocol</div>
              <a
                href={
                  "https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0x5f98805A4E8be255a32880FDeC7F6728C6568bA0"
                }
                target="_"
                style={{ fontSize: `1rem` }}
              >
                LUSD
              </a>
            </div>
          </JarName>
          <CenteredGrid xs={24} sm={8} md={3} lg={3}>
            <Data isZero={balNum === 0}>{balStr}</Data>
            <Label>Wallet Balance</Label>
          </CenteredGrid>
          <CenteredGrid xs={24} sm={8} md={3} lg={3}>
            <Data isZero={depositedNum === 0}>{depositedStr}</Data>
            <Label>Deposited</Label>
          </CenteredGrid>
          <CenteredGrid xs={24} sm={8} md={3} lg={3}>
            <Data isZero={depositedNum === 0}>
              <Tooltip text={`${valueStr} LUSD + ${pendingLqtyStr} pLQTY`}>
                ${formatString(userValue + pendingLqtyNum * prices?.lqty)}
                <img
                  src="./question.svg"
                  width="15px"
                  style={{ marginLeft: 5 }}
                />
              </Tooltip>
            </Data>
            <Label>Deposit Value</Label>
          </CenteredGrid>
          <CenteredGrid xs={24} sm={12} md={5} lg={5}>
            <Data>
              {lqtyApr.toFixed(2)}% lqty +{" "}
              {((liquidationApy * 0.8 * lqtyApr) / 2).toFixed(2)}%{" "}
              <a
                href="https://docs.liquity.org/faq/stability-pool-and-liquidations"
                target="_"
              >
                liquidation
              </a>
            </Data>
            <Data>
              <div style={{ marginTop: 5 }}>
                <Label>APY</Label>
              </div>
            </Data>
          </CenteredGrid>
          <CenteredGrid xs={24} sm={12} md={4} lg={4}>
            <Data isZero={tvl === 0}>${getFormatString(tvl)}</Data>
            <Label>TVL</Label>
          </CenteredGrid>
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
                    return pBAMMContract
                      .connect(signer)
                      .deposit(ethers.utils.parseEther(depositAmount), {
                        gasLimit: 500000,
                      });
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
            <div>{`Balance ${depositedStr} (${valueStr} B.Protocol LUSD)`}</div>
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
                  token: BPAddresses.pBAMM,
                  recipient: BPAddresses.pBAMM,
                  transferCallback: async () => {
                    return pBAMMContract
                      .connect(signer)
                      .withdraw(ethers.utils.parseEther(withdrawAmount), {
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
          <div
            style={{
              width: "100%",
              textAlign: "center",
              paddingTop: "4px",
              fontFamily: "Source Sans Pro",
            }}
          ></div>
        </Grid>
      </Grid.Container>
      <Spacer y={0.5} />
      {Boolean(+plqtyStr) && (
        <Button
          disabled={stakeButton.disabled}
          onClick={() => {
            if (gauge && signer) {
              transfer({
                token: BPAddresses.pLQTY,
                recipient: BPAddresses.LQTY_GAUGE,
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
      )}
      <Spacer y={1} />
      This jar deposits into B.Protocol's Backstop AMM. All ETH liquidations are
      automatically sold back into users' LUSD positions and all LQTY rewards
      are staked in the Pickle Jar, which compounds ETH and LUSD rewards. pLQTY
      is automatically harvested upon withdrawing or depositing.
    </Collapse>
  );
};
