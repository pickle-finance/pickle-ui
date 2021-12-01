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
import { uncompoundAPY } from "util/jars";
import { JarApy } from "./MiniFarmList";
import { useTranslation } from "next-i18next";
import { isUsdcToken } from "containers/Jars/jars";

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
  // Please ensure addresses are lowercased
  "0x8e68c0216562bcea5523b27ec6b9b6e1cccbbf88": (
    <LpIcon swapIconSrc={"/cherryswap.png"} tokenIconSrc={"/okex.png"} />
  ),
  "0x089dedbfd12f2ad990c55a2f1061b8ad986bff88": (
    <LpIcon swapIconSrc={"/cherryswap.png"} tokenIconSrc={"/usdt.png"} />
  ),
  "0x407f7a2f61e5bab199f7b9de0ca330527175da93": (
    <LpIcon swapIconSrc={"/cherryswap.png"} tokenIconSrc={"/ethereum.png"} />
  ),
  "0xf3098211d012ff5380a03d80f150ac6e5753caa8": (
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
  "0xe9313b7dea9cbabd2df710c25bef44a748ab38a9": (
    <LpIcon swapIconSrc={"/jswap.png"} tokenIconSrc={"/dai.png"} />
  ),
  "0xa25e1c05c58ede088159cc3cd24f49445d0be4b2": (
    <LpIcon swapIconSrc={"/jswap.png"} tokenIconSrc={"/usdc.png"} />
  ),

  // Moonriver
  "0x7eda899b3522683636746a2f3a7814e6ffca75e1": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/moonriver.png"} />
  ),
  "0xfe1b71bdaee495dca331d28f5779e87bd32fbe53": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/daiusdc.png"} />
  ),
  "0xe537f70a8b62204832b8ba91940b77d3f79aeb81": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/usdcmovr.png"} />
  ),
  "0xdb66be1005f5fe1d2f486e75ce3c50b52535f886": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/usdc.png"} />
  ),
  "0x2a44696ddc050f14429bd8a4a05c750c6582bf3b": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/usdcusdt.png"} />
  ),
  "0x384704557f73fbfae6e9297fd1e6075fc340dbe5": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/busd.png"} />
  ),
  "0xa0d8dfb2cc9dfe6905edd5b71c56ba92ad09a3dc": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/weth.png"} />
  ),
  "0xfb1d0d6141fc3305c63f189e39cc2f2f7e58f4c2": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/bnb.png"} />
  ),
  "0x83d7a3fc841038e8c8f46e6192bbcca8b19ee4e7": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/wbtc.png"} />
  ),
  "0xb9a61ac826196abc69a3c66ad77c563d6c5bdd7b": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/avax.png"} />
  ),
  "0x55ee073b38bf1069d5f1ed0aa6858062ba42f5a9": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/mimatic.png"} />
  ),
  "0x9051fb701d6d880800e397e5b5d46fddfadc7056": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/mim.webp"} />
  ),
  "0x1eebed8f28a6865a76d91189fd6fc45f4f774d67": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/fantom.png"} />
  ),
  "0x9e0d90ebb44c22303ee3d331c0e4a19667012433": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/relay.png"} />
  ),
  "0xf9b7495b833804e4d894fc5f7b39c10016e0a911": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/rib.png"} />
  ),
  "0x9f9a7a3f8f56afb1a2059dae1e978165816cea44": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/pets.png"} />
  ),
  "0x0acdb54e610dabc82b8fa454b21ad425ae460df9": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/rib.png"} />
  ),
  "0x9432b25fbd8a37e5a1300e36a96bd14e1e6f5c90": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/mim.webp"} />
  ),
  "0x2cc54b4a3878e36e1c754871438113c1117a3ad7": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/frax.webp"} />
  ),
  "0xbe2abe58edaae96b4303f194d2fad5233bad3d87": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/bnb.png"} />
  ),
  "0x0d171b55fc8d3bddf17e376fdb2d90485f900888": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/weth.png"} />
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

  const isUsdc = isUsdcToken(depositToken.address);

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
                  depositToken.address.toLowerCase() as keyof typeof JAR_DEPOSIT_TOKEN_TO_ICON
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
