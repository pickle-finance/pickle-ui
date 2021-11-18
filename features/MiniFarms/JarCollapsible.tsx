import { ethers } from "ethers";
import styled from "styled-components";

import { useState, FC, useEffect, ReactNode } from "react";
import { Button, Link, Input, Grid, Spacer, Tooltip } from "@geist-ui/react";

import { Connection } from "../../containers/Connection";
import { formatEther } from "ethers/lib/utils";
import ReactHtmlParser from "react-html-parser";
import {
  ERC20Transfer,
  Status as ERC20TransferStatus,
} from "../../containers/Erc20Transfer";
import Collapse from "../Collapsible/Collapse";
import { UserJarData } from "../../containers/UserJars";
import { LpIcon, TokenIcon } from "../../components/TokenIcon";
import { getFormatString } from "../Gauges/GaugeInfo";
import { JAR_DEPOSIT_TOKENS } from "../../containers/Jars/jars";
import { NETWORK_NAMES } from "containers/config";
import { uncompoundAPY } from "util/jars";
import { JarApy } from "./MiniFarmList";
import { useTranslation } from "next-i18next";

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
  // OKEx
  "0x8E68C0216562BCEA5523b27ec6B9B6e1cCcBbf88": (
    <LpIcon swapIconSrc={"/cherryswap.png"} tokenIconSrc={"/okex.png"} />
  ),
  "0x089dedbFD12F2aD990c55A2F1061b8Ad986bFF88": (
    <LpIcon swapIconSrc={"/cherryswap.png"} tokenIconSrc={"/usdt.png"} />
  ),
  "0x407F7a2F61E5bAB199F7b9de0Ca330527175Da93": (
    <LpIcon swapIconSrc={"/cherryswap.png"} tokenIconSrc={"/ethereum.png"} />
  ),
  "0xF3098211d012fF5380A03D80f150Ac6E5753caA8": (
    <LpIcon swapIconSrc={"/cherryswap.png"} tokenIconSrc={"/okex.png"} />
  ),
  "0x8009edebbbdeb4a3bb3003c79877fcd98ec7fb45": (
    <LpIcon swapIconSrc={"/jswap.png"} tokenIconSrc={"/usdt.png"} />
  ),
  "0x838a7a7f3e16117763c109d98c79ddcd69f6fd6e": (
    <LpIcon swapIconSrc={"/jswap.png"} tokenIconSrc={"/wbtc.png"} />
  ),
  "0xeb02a695126b998e625394e43dfd26ca4a75ce2b": (
    <LpIcon swapIconSrc={"/jswap.png"} tokenIconSrc={"/weth.png"} />
  ),
  "0xE9313b7dea9cbaBd2df710C25bef44A748Ab38a9": (
    <LpIcon swapIconSrc={"/jswap.png"} tokenIconSrc={"/dai.png"} />
  ),
  "0xa25E1C05c58EDE088159cc3cD24f49445d0BE4b2": (
    <LpIcon swapIconSrc={"/jswap.png"} tokenIconSrc={"/usdc.png"} />
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

export const JarCollapsible: FC<{
  jarData: UserJarData;
  isYearnJar?: boolean;
}> = ({ jarData }) => {
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
    tvlUSD,
  } = jarData;
  const { t } = useTranslation("common");

  const isUsdc =
    depositToken.address.toLowerCase() ===
    JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].USDC.toLowerCase();

  const uncompounded = APYs.map((x) => {
    const k: string = Object.keys(x)[0];
    const shouldNotUncompound = k === "pickle" || k === "lp";
    const v = shouldNotUncompound
      ? Object.values(x)[0]
      : uncompoundAPY(Object.values(x)[0]);
    const ret: JarApy = {};
    ret[k] = v;
    return ret;
  });

  const totalAPR: number = uncompounded
    .map((x) => {
      return Object.values(x).reduce((acc, y) => acc + y, 0);
    })
    .reduce((acc, x) => acc + x, 0);
  const difference = totalAPY - totalAPR;

  const tooltipText = [
    `${t("farms.baseAPRs")}:`,
    ...uncompounded.map((x) => {
      const k = Object.keys(x)[0];
      const v = Object.values(x)[0];
      return `${k}: ${v.toFixed(2)}%`;
    }),
    `${t(
      "farms.compounding",
    )} <img src="/magicwand.svg" height="16" width="16"/>: ${difference.toFixed(
      2,
    )}%`,
  ]
    .filter((x) => x)
    .join(" <br/> ");

  const balNum = parseFloat(
    formatEther(isUsdc && balance ? balance.mul(USDC_SCALE) : balance),
  );
  const depositedNum = parseFloat(
    formatEther(isUsdc && deposited ? deposited.mul(USDC_SCALE) : deposited),
  );
  const balStr = balNum.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: balNum < 1 ? 8 : 4,
  });
  const depositedStr = depositedNum.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: depositedNum < 1 ? 8 : 4,
  });
  const depositedUnderlyingStr = (
    parseFloat(
      formatEther(isUsdc && deposited ? deposited.mul(USDC_SCALE) : deposited),
    ) * ratio
  ).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: depositedNum < 1 ? 8 : 4,
  });
  const valueStr = (usdPerPToken * depositedNum).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

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
  const { signer, chainName } = Connection.useContainer();

  useEffect(() => {
    const dStatus = getTransferStatus(
      depositToken.address,
      jarContract.address,
    );
    const wStatus = getTransferStatus(jarContract.address, jarContract.address);

    setButtonStatus(dStatus, t("farms.depositing"), t("farms.deposit"), setDepositButton);
    setButtonStatus(wStatus, t("farms.withdrawing"), t("farms.withdraw"), setWithdrawButton);
  }, [erc20TransferStatuses]);

  return (
    <Collapse
      style={{ borderWidth: "1px", boxShadow: "none" }}
      shadow
      preview={
        <Grid.Container gap={1}>
          <JarName xs={24} sm={12} md={5} lg={6}>
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
          <Grid xs={24} sm={8} md={4} lg={4} css={{ textAlign: "center" }}>
            <Data isZero={balNum === 0}>{balStr}</Data>
            <Label>{t("balances.balance")}</Label>
          </Grid>
          <Grid xs={24} sm={8} md={4} lg={3} css={{ textAlign: "center" }}>
            <Data isZero={depositedNum === 0}>{depositedStr}</Data>
            <Label>{t("farms.deposited")}</Label>
          </Grid>
          <Grid xs={24} sm={8} md={4} lg={3} css={{ textAlign: "center" }}>
            <Data isZero={usdPerPToken * depositedNum === 0}>${valueStr}</Data>
            <Label>{t("balances.depositValue")}</Label>
          </Grid>

          <Grid xs={24} sm={12} md={5} lg={4} css={{ textAlign: "center" }}>
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
                <span>{t("balances.apy")}</span>
              </div>
            </Data>
          </Grid>
          <Grid xs={24} sm={12} md={4} lg={4} css={{ textAlign: "center" }}>
            <Data isZero={tvlUSD === 0}>${getFormatString(tvlUSD)}</Data>
            <Label>{t("balances.tvl")}</Label>
          </Grid>
        </Grid.Container>
      }
    >
      <Spacer y={1} />
      <Grid.Container gap={2}>
        <Grid xs={24} md={depositedNum ? 12 : 24}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
            {t("balances.balance")}: {balStr} {depositTokenName}
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
                  token: depositToken.address,
                  recipient: jarContract.address,
                  transferCallback: async () => {
                    return jarContract
                      .connect(signer)
                      .deposit(
                        ethers.utils.parseUnits(depositAmount, isUsdc ? 6 : 18),
                      );
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
        {depositedNum !== 0 && (
          <Grid xs={24} md={12}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                {t("balances.balance")} {depositedStr} (
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
    </Collapse>
  );
};
