import { ethers } from "ethers";
import { formatEther } from "ethers/lib/utils";
import styled from "styled-components";
import { useTranslation } from "next-i18next";

import { useState, FC, useEffect, ReactNode } from "react";
import Collapse from "../Collapsible/Collapse";
import { ERC20Transfer } from "../../containers/Erc20Transfer";
import { Connection } from "../../containers/Connection";
import { usePBAMM } from "../../containers/Jars/usePBAMM";
import { Contracts } from "../../containers/Contracts";
import { Prices } from "../../containers/Prices";
import { BPAddresses } from "v1/containers/config";
import { Gauge__factory as GaugeFactory } from "../../containers/Contracts/factories/Gauge__factory";
import { LpIcon, TokenIcon } from "../../components/TokenIcon";
import { Button, Link, Input, Grid, Spacer, Tooltip } from "@geist-ui/react";
import { useDuneData } from "../../containers/Jars/useDuneData";
import { getFormatString } from "./GaugeInfo";
import { useButtonStatus, ButtonStatus } from "v1/hooks/useButtonStatus";

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

export const BProtocol: FC<{ showUserJars: boolean }> = ({ showUserJars }) => {
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
    userPendingPLqty,
    userPendingLqty,
    tvl,
  } = usePBAMM();
  const { duneData } = useDuneData();
  const { setButtonStatus } = useButtonStatus();

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const { t } = useTranslation("common");

  const gauge = signer && GaugeFactory.connect(BPAddresses.LQTY_GAUGE, signer);

  const balNum = parseFloat(formatEther(lusdBalance));
  const balStr = formatString(balNum);
  const depositedNum = parseFloat(formatEther(pbammBalance));
  const depositedStr = formatString(depositedNum);
  const valueStr = formatString(userValue);
  const plqtyStr = formatString(+formatEther(plqtyBalance));
  const pendingPLqtyStr = formatString(userPendingPLqty);
  const pendingLqtyStr = formatString(userPendingLqty);
  const liquidationApy = duneData?.data?.get_result_by_result_id[0].data?.apr / 100;

  const [depositButton, setDepositButton] = useState<ButtonStatus>({
    disabled: false,
    text: t("farms.deposit"),
  });
  const [withdrawButton, setWithdrawButton] = useState<ButtonStatus>({
    disabled: false,
    text: t("farms.withdraw"),
  });
  const [stakeButton, setStakeButton] = useState<ButtonStatus>({
    disabled: false,
    text: t("farms.stakeUnstaked", { amount: plqtyStr }),
  });

  useEffect(() => {
    const dStatus = getTransferStatus(BPAddresses.LUSD, BPAddresses.pBAMM);
    const wStatus = getTransferStatus(BPAddresses.pBAMM, BPAddresses.pBAMM);
    const stakeStatus = getTransferStatus(BPAddresses.pLQTY, BPAddresses.LQTY_GAUGE);

    setButtonStatus(dStatus, t("farms.depositing"), t("farms.deposit"), setDepositButton);
    setButtonStatus(wStatus, t("farms.withdrawing"), t("farms.withdraw"), setWithdrawButton);
    setButtonStatus(
      stakeStatus,
      t("farms.staking"),
      t("farms.stakeUnstaked", { amount: plqtyStr }),
      setStakeButton,
    );
  }, [erc20TransferStatuses, plqtyBalance]);

  if (!pBAMMContract || (showUserJars && !depositedNum)) return <> </>;
  return (
    <>
      {t("farms.poweredBy")}&nbsp;
      <a href="https://bprotocol.org/" target="_">
        B.Protocol
      </a>
      &nbsp;⚡ {`(${t("farms.bProtocol.feeNote")})`}
      <Grid xs={24}>
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
                <Label>{t("balances.walletBalance")}</Label>
              </CenteredGrid>
              <CenteredGrid xs={24} sm={8} md={3} lg={3}>
                <Data isZero={depositedNum === 0}>{depositedStr}</Data>
                <Label>{t("farms.deposited")}</Label>
              </CenteredGrid>
              <CenteredGrid xs={24} sm={8} md={3} lg={3}>
                <Data isZero={depositedNum === 0}>
                  <Tooltip text={`${valueStr} LUSD + ${pendingPLqtyStr} pLQTY`}>
                    ${formatString((userValue + +pendingLqtyStr * prices?.lqty).toFixed(2))}
                    <img src="/question.svg" width="15px" style={{ marginLeft: 5 }} />
                  </Tooltip>
                </Data>
                <Label>{t("balances.depositValue")}</Label>
              </CenteredGrid>
              <CenteredGrid xs={24} sm={12} md={5} lg={5}>
                <Data>
                  {lqtyApr.toFixed(2)}% lqty + {((liquidationApy * 0.8 * lqtyApr) / 2).toFixed(2)}%{" "}
                  <a href="https://docs.liquity.org/faq/stability-pool-and-liquidations" target="_">
                    {t("farms.bProtocol.liquidation")}
                  </a>
                </Data>
                <Data>
                  <div style={{ marginTop: 5 }}>
                    <Label>{t("balances.apy")}</Label>
                  </div>
                </Data>
              </CenteredGrid>
              <CenteredGrid xs={24} sm={12} md={4} lg={4}>
                <Data isZero={tvl === 0}>${getFormatString(tvl)}</Data>
                <Label>{t("balances.tvl")}</Label>
              </CenteredGrid>
            </Grid.Container>
          }
        >
          <Grid.Container gap={2}>
            <Grid xs={24} md={12}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  {t("balances.balance")}: {balStr}
                </div>
                <Link
                  color
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setDepositAmount(formatEther(lusdBalance));
                  }}
                >
                  {t("balances.max")}
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
              <div style={{ display: "flex", justifyContent: "space-between" }}></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  {t("balances.balance")}: {depositedStr} ({valueStr} LUSD + {pendingPLqtyStr}{" "}
                  pLQTY)
                </div>
                <Link
                  color
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setWithdrawAmount(formatEther(pbammBalance));
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
          {t("farms.bProtocol.info")}
        </Collapse>
        <Spacer y={1} />
      </Grid>
    </>
  );
};
