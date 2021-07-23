import { ethers } from "ethers";
import styled from "styled-components";
import { useState, FC, useEffect } from "react";
import { Button, Link, Input, Grid, Spacer, Tooltip } from "@geist-ui/react";
import { formatEther } from "ethers/lib/utils";

import { JAR_FARM_MAP, PICKLE_ETH_FARM } from "../../containers/Farms/farms";
import { UserFarmData } from "../../containers/UserFarms";
import { Connection } from "../../containers/Connection";
import { Contracts } from "../../containers/Contracts";
import { Jars } from "../../containers/Jars";
import { JarApy } from "../../containers/Jars/useJarsWithAPYEth";
import {
  ERC20Transfer,
  Status as ERC20TransferStatus,
} from "../../containers/Erc20Transfer";
import Collapse from "../Collapsible/Collapse";
import { useUniPairDayData } from "../../containers/Jars/useUniPairDayData";
import { LpIcon, TokenIcon } from "../../components/TokenIcon";

interface ButtonStatus {
  disabled: boolean;
  text: string;
}

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

export const FarmCollapsible: FC<{ farmData: UserFarmData }> = ({
  farmData,
}) => {
  const { jars } = Jars.useContainer();

  const {
    poolName,
    poolIndex,
    depositToken,
    depositTokenName,
    balance,
    staked,
    harvestable,
    usdPerToken,
    apy,
  } = farmData;
  const stakedNum = parseFloat(formatEther(staked));
  const valueStr = (stakedNum * usdPerToken).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const bal = parseFloat(formatEther(balance));
  const balStr = bal.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: bal < 1 ? 18 : 4,
  });
  const stakedStr = stakedNum.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: stakedNum < 1 ? 18 : 4,
  });
  const harvestableStr = parseFloat(
    formatEther(harvestable || 0),
  ).toLocaleString();

  const {
    status: erc20TransferStatuses,
    transfer,
    getTransferStatus,
  } = ERC20Transfer.useContainer();
  const { masterchefV2 } = Contracts.useContainer();
  const { signer, address } = Connection.useContainer();

  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");

  const [stakeButton, setStakeButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Stake",
  });
  const [unstakeButton, setUnstakeButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Unstake",
  });
  const [harvestButton, setHarvestButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Harvest",
  });

  // Get Jar APY (if its from a Jar)
  let APYs: JarApy[] = [{ pickle: apy * 100 }];

  const { getUniPairDayAPY } = useUniPairDayData();
  if (depositToken.address.toLowerCase() === PICKLE_ETH_FARM.toLowerCase()) {
    APYs = [...APYs, ...getUniPairDayAPY(PICKLE_ETH_FARM)];
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
    if (masterchefV2) {
      const stakeStatus = getTransferStatus(
        depositToken.address,
        masterchefV2.address,
      );
      const unstakeStatus = getTransferStatus(
        masterchefV2.address,
        depositToken.address,
      );
      const harvestStatus = getTransferStatus(
        masterchefV2.address,
        poolIndex.toString(),
      );

      setButtonStatus(stakeStatus, "Staking...", "Stake", setStakeButton);
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
  }, [erc20TransferStatuses]);

  return (
    <Collapse
      style={{ borderWidth: "1px", boxShadow: "none" }}
      shadow
      preview={
        <Grid.Container gap={1}>
          <Grid xs={24} sm={12} md={5} lg={5}>
            <TokenIcon
              src={
                <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/pickle.png"} />
              }
            />
            <div style={{ width: "100%" }}>
              <div style={{ fontSize: `1rem` }}>{poolName}</div>
              <Label style={{ fontSize: `1rem` }}>{depositTokenName}</Label>
            </div>
          </Grid>
          <Grid xs={24} sm={12} md={3} lg={3}>
            <Tooltip text={apy === 0 ? "--" : tooltipText}>
              <div>{apy === 0 ? "--%" : totalAPY.toFixed(2) + "%"}</div>
              <Label>Total APY</Label>
            </Tooltip>
          </Grid>
          <Grid xs={24} sm={6} md={4} lg={4}>
            <Data isZero={parseFloat(formatEther(harvestable || 0)) === 0}>
              {harvestableStr}
            </Data>
            <Label>Earned</Label>
          </Grid>
          <Grid xs={24} sm={6} md={4} lg={4}>
            <Data isZero={bal === 0}>{balStr}</Data>
            <Label>Balance</Label>
          </Grid>
          <Grid xs={24} sm={6} md={4} lg={4}>
            <Data isZero={stakedNum === 0}>{stakedStr}</Data>
            <Label>Staked</Label>
          </Grid>
          <Grid xs={24} sm={6} md={4} lg={4}>
            <Data isZero={stakedNum * usdPerToken === 0}>${valueStr}</Data>
            <Label>Value Staked</Label>
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
                setStakeAmount(formatEther(balance));
              }}
            >
              Max
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
              if (masterchefV2 && signer && address) {
                transfer({
                  token: depositToken.address,
                  recipient: masterchefV2.address,
                  transferCallback: async () => {
                    return masterchefV2
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
            <div>Staked: {stakedStr}</div>
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
          <Spacer y={0.5} />
          <Button
            disabled={unstakeButton.disabled}
            onClick={() => {
              if (masterchefV2 && signer && address) {
                transfer({
                  token: masterchefV2.address,
                  recipient: depositToken.address,
                  approval: false,
                  transferCallback: async () => {
                    return masterchefV2
                      .connect(signer)
                      .withdraw(
                        poolIndex,
                        ethers.utils.parseEther(unstakeAmount),
                        address
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
        <Spacer />
        <Grid xs={24}>
          <Spacer />
          <Button
            disabled={harvestButton.disabled}
            onClick={() => {
              if (masterchefV2 && signer && address) {
                transfer({
                  token: masterchefV2.address,
                  recipient: masterchefV2.address,
                  approval: false,
                  transferCallback: async () => {
                    return masterchefV2.connect(signer).harvest(poolIndex, address);
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
            PICKLE and SUSHI automatically harvested on staking and unstaking.
          </div>
        </Grid>
      </Grid.Container>
    </Collapse>
  );
};