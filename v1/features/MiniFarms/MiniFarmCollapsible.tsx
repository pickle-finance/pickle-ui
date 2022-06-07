import { ethers } from "ethers";
import styled from "styled-components";
import { useState, FC, useEffect, ReactNode } from "react";
import { Button, Link, Input, Grid, Spacer, Tooltip } from "@geist-ui/react";
import { formatEther, formatUnits } from "ethers/lib/utils";
import { useTranslation } from "next-i18next";

import { useJarFarmMap } from "../../containers/Farms/farms";
import { UserFarmDataMatic } from "../../containers/UserMiniFarms";
import { Connection } from "../../containers/Connection";
import { Contracts } from "../../containers/Contracts";
import { Jars } from "../../containers/Jars";
import { ERC20Transfer } from "../../containers/Erc20Transfer";
import Collapse from "../Collapsible/Collapse";
import { JarApy } from "../../containers/Jars/useJarsWithAPYPFCore";
import { LpIcon, TokenIcon, MiniIcon } from "../../components/TokenIcon";
import { useButtonStatus, ButtonStatus } from "v1/hooks/useButtonStatus";
import { PickleCore } from "v1/containers/Jars/usePickleCore";

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
  "0xC3f393FB40F8Cc499C1fe7FA5781495dc6FAc9E9": (
    <LpIcon swapIconSrc={"/cherryswap.png"} tokenIconSrc={"/okex.png"} />
  ),
};

export const MiniFarmCollapsible: FC<{ farmData: UserFarmDataMatic }> = ({ farmData }) => {
  const { pickleCore } = PickleCore.useContainer();
  const { jars } = Jars.useContainer();
  const jarFarmMap = useJarFarmMap();

  const { t } = useTranslation("common");

  const {
    poolName,
    poolIndex,
    depositToken,
    depositTokenName,
    depositTokenDecimals,
    balance,
    staked,
    harvestable,
    usdPerToken,
    apy,
    maticApy,
    harvestableMatic,
  } = farmData;
  const stakedNum = parseFloat(formatUnits(staked, depositTokenDecimals));
  const balanceNum = parseFloat(formatUnits(balance, depositTokenDecimals));
  const valueStr = (stakedNum * usdPerToken).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const bal = parseFloat(formatEther(balance));
  const balStr = bal.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: bal < 1 ? 8 : 4,
  });
  const stakedStr = stakedNum.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: stakedNum < 1 ? 8 : 4,
  });
  const harvestableStr = parseFloat(formatEther(harvestable || 0)).toLocaleString();

  const harvestableMaticStr = parseFloat(formatEther(harvestableMatic || 0)).toLocaleString();

  const {
    status: erc20TransferStatuses,
    transfer,
    getTransferStatus,
  } = ERC20Transfer.useContainer();
  const { minichef } = Contracts.useContainer();
  const { signer, address, chainName } = Connection.useContainer();
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const { setButtonStatus } = useButtonStatus();

  const [stakeButton, setStakeButton] = useState<ButtonStatus>({
    disabled: false,
    text: t("farms.stake"),
  });
  const [unstakeButton, setUnstakeButton] = useState<ButtonStatus>({
    disabled: false,
    text: t("farms.unstake"),
  });
  const [harvestButton, setHarvestButton] = useState<ButtonStatus>({
    disabled: false,
    text: t("farms.harvest"),
  });

  // Get Jar APY (if its from a Jar)
  let APYs: JarApy[] = [{ pickle: apy * 100 }, { matic: maticApy * 100 }];

  const maybeJar = jarFarmMap[depositToken.address];
  if (jars && maybeJar) {
    const farmingJar = jars.filter((x) => x.jarName === maybeJar.jarName)[0];
    APYs = farmingJar?.APYs ? [...APYs, ...farmingJar.APYs] : APYs;
  }
  const tooltipText = APYs.map((x) => {
    const k = Object.keys(x)[0];
    const v = Object.values(x)[0];
    return `${k}: ${v.toFixed(2)}%`;
  }).join(" + ");

  const totalAPY = APYs.map((x) => {
    return Object.values(x).reduce((acc, y) => acc + y, 0);
  }).reduce((acc, x) => acc + x, 0);

  useEffect(() => {
    if (minichef) {
      const stakeStatus = getTransferStatus(depositToken.address, minichef.address);
      const unstakeStatus = getTransferStatus(minichef.address, depositToken.address);
      const harvestStatus = getTransferStatus(minichef.address, poolIndex.toString());

      setButtonStatus(stakeStatus, t("farms.staking"), t("farms.stake"), setStakeButton);
      setButtonStatus(unstakeStatus, t("farms.unstaking"), t("farms.unstake"), setUnstakeButton);
      setButtonStatus(harvestStatus, t("farms.harvesting"), t("farms.harvest"), setHarvestButton);
    }
  }, [erc20TransferStatuses]);

  return (
    <Collapse
      style={{ borderWidth: "1px", boxShadow: "none" }}
      shadow
      preview={
        <Grid.Container gap={1}>
          <Grid xs={24} sm={12} md={5} lg={5}>
            <TokenIcon
              src={FARM_LP_TO_ICON[depositToken.address as keyof typeof FARM_LP_TO_ICON]}
            />
            <div style={{ width: "100%" }}>
              <div style={{ fontSize: `1rem` }}>{poolName}</div>
              <Label style={{ fontSize: `0.85rem` }}>{depositTokenName}</Label>
            </div>
          </Grid>
          <Grid xs={24} sm={12} md={3} lg={3}>
            <Tooltip text={maticApy === 0 ? "--" : tooltipText}>
              <div>{maticApy === 0 ? "--%" : totalAPY.toFixed(2) + "%"}</div>
              <br />
              <Label>{t("balances.totalApy")}</Label>
            </Tooltip>
          </Grid>
          <Grid xs={24} sm={6} md={4} lg={4}>
            <Data isZero={parseFloat(formatEther(harvestableMatic || 0)) === 0}>
              {harvestableStr} <MiniIcon source={"/pickle.png"} />
              <br />
              {harvestableMaticStr} <MiniIcon source={"/matic.png"} />
            </Data>
            <Label>{t("balances.earned")}</Label>
          </Grid>
          <Grid xs={24} sm={6} md={4} lg={4}>
            <Data isZero={bal === 0}>{balStr}</Data>
            <br />
            <Label>{t("balances.balance")}</Label>
          </Grid>
          <Grid xs={24} sm={6} md={4} lg={4}>
            <Data isZero={stakedNum === 0}>{stakedStr}</Data>
            <br />
            <Label>{t("balances.staked")}</Label>
          </Grid>
          <Grid xs={24} sm={6} md={4} lg={4}>
            <Data isZero={stakedNum * usdPerToken === 0}>${valueStr}</Data>
            <br />
            <Label>{t("balances.valueStaked")}</Label>
          </Grid>
        </Grid.Container>
      }
    >
      <Spacer y={1} />
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
                setStakeAmount(formatEther(balance));
              }}
            >
              {t("balances.max")}
            </Link>
          </div>
          <Input
            onChange={(e) => setStakeAmount(e.target.value)}
            value={stakeAmount}
            width="100%"
            type="number"
            size="large"
          />
          <Spacer y={0.5} />
          <Button
            disabled={stakeButton.disabled}
            onClick={() => {
              if (minichef && signer && address) {
                transfer({
                  token: depositToken.address,
                  recipient: minichef.address,
                  approvalAmountRequired: ethers.utils.parseEther(stakeAmount),
                  transferCallback: async () => {
                    return minichef
                      .connect(signer)
                      .deposit(poolIndex, ethers.utils.parseEther(stakeAmount), address);
                  },
                });
              }
            }}
            style={{ width: "100%" }}
          >
            {stakeButton.text}
          </Button>
        </Grid>
        <Grid xs={24} md={12}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              {t("balances.staked")}: {stakedStr}
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
          <Spacer y={0.5} />
          <Button
            disabled={unstakeButton.disabled}
            onClick={() => {
              if (minichef && signer && address) {
                transfer({
                  token: minichef.address,
                  recipient: depositToken.address,
                  approval: false,
                  transferCallback: async () => {
                    return minichef
                      .connect(signer)
                      .withdrawAndHarvest(
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
      <Spacer />
      <Button
        disabled={harvestButton.disabled}
        onClick={() => {
          if (minichef && signer && address) {
            transfer({
              token: minichef.address,
              recipient: minichef.address + poolIndex.toString(), // Doesn't matter since we don't need approval
              approval: false,
              transferCallback: async () => {
                return minichef.connect(signer).harvest(poolIndex, address);
              },
            });
          }
        }}
        style={{ width: "100%" }}
      >
        {harvestButton.text}
      </Button>
      <div
        style={{
          width: "100%",
          textAlign: "center",
          fontFamily: "Source Sans Pro",
          fontSize: "0.8rem",
        }}
      >
        {t("farms.polygon.rewards")}
      </div>
    </Collapse>
  );
};
