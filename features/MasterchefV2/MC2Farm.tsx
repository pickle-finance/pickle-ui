import { ethers } from "ethers";
import styled from "styled-components";
import { useState, FC, useEffect } from "react";
import { Button, Link, Input, Grid, Spacer, Tooltip } from "@geist-ui/react";
import { formatEther } from "ethers/lib/utils";

import { JAR_FARM_MAP, PICKLE_ETH_FARM } from "../../containers/Farms/farms";
import { UserFarmData } from "../../containers/UserFarms";
import { Connection } from "../../containers/Connection";
import { Contracts, PICKLE_ETH_SLP } from "../../containers/Contracts";
import { Jars } from "../../containers/Jars";
import { JarApy } from "../../containers/Jars/useJarsWithAPYEth";
import {
  ERC20Transfer,
  Status as ERC20TransferStatus,
} from "../../containers/Erc20Transfer";
import Collapse from "../Collapsible/Collapse";
import { useSushiPairDayData } from "../../containers/Jars/useSushiPairDayData";
import { LpIcon, TokenIcon, MiniIcon } from "../../components/TokenIcon";
import { useMC2 } from "../../containers/Gauges/useMC2";

const PICKLE_PID = 3;

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

const formatString = (num: number) =>
  num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: num < 1 ? 8 : 4,
  });

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

export const MC2Farm: FC = () => {
  const {
    slpStaked,
    slpBalance,
    userValue,
    apy,
    pendingPickle,
    pendingSushi,
  } = useMC2();

  const balNum = parseFloat(formatEther(slpBalance));
  const balStr = formatString(balNum);
  const depositedNum = parseFloat(formatEther(slpStaked));
  const depositedStr = formatString(depositedNum);
  const valueStr = formatString(userValue);
  const pendingPickleNum = +formatEther(pendingPickle);
  const pendingPickleStr = formatString(pendingPickleNum);
  const pendingSushiNum = +formatEther(pendingSushi);
  const pendingSushiStr = formatString(pendingSushiNum);

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
  let APYs: JarApy[] = [
    { pickle: apy?.pickle * 100 },
    { sushi: apy?.sushi * 100 },
  ];

  const { getSushiPairDayAPY } = useSushiPairDayData();

  APYs = [...APYs, ...getSushiPairDayAPY(PICKLE_ETH_SLP)];

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
        PICKLE_ETH_SLP,
        masterchefV2.address,
      );
      const unstakeStatus = getTransferStatus(
        masterchefV2.address,
        PICKLE_ETH_SLP,
      );
      const harvestStatus = getTransferStatus(
        masterchefV2.address,
        PICKLE_PID.toString(),
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
          <Grid xs={24} sm={12} md={6} lg={6}>
            <TokenIcon
              src={
                <LpIcon
                  swapIconSrc={"/sushiswap.png"}
                  tokenIconSrc={"/pickle.png"}
                />
              }
            />
            <div style={{ width: "100%" }}>
              <div style={{ fontSize: `1rem` }}>SushiSwap MasterChefv2</div>
              <Label style={{ fontSize: `1rem` }}>PICKLE/ETH SLP</Label>
            </div>
          </Grid>
          <Grid xs={24} sm={12} md={3} lg={3}>
            <Tooltip text={apy?.pickle === 0 ? "--" : tooltipText}>
              <div>{apy?.pickle === 0 ? "--%" : totalAPY.toFixed(2) + "%"}</div>
              <br />
              <Label>Total APY</Label>
            </Tooltip>
          </Grid>
          <Grid xs={24} sm={6} md={3} lg={3}>
            <Data isZero={pendingPickleNum === 0}>
              {pendingPickleStr} <MiniIcon source={"/pickle.png"} />
              <br />
              {pendingSushiStr} <MiniIcon source={"/sushiswap.png"} />
            </Data>
            <Label>Earned</Label>
          </Grid>
          <Grid xs={24} sm={6} md={4} lg={4}>
            <Data isZero={balNum === 0}>{balStr}</Data>
              <br />
            <Label>Balance</Label>
          </Grid>
          <Grid xs={24} sm={6} md={4} lg={4}>
            <Data isZero={depositedNum === 0}>{depositedStr}</Data>
              <br />
            <Label>Staked</Label>
          </Grid>
          <Grid xs={24} sm={6} md={4} lg={4}>
            <Data isZero={userValue === 0}>${valueStr}</Data>
              <br />
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
                setStakeAmount(formatEther(slpBalance));
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
                  token: PICKLE_ETH_SLP,
                  recipient: masterchefV2.address,
                  transferCallback: async () => {
                    return masterchefV2
                      .connect(signer)
                      .deposit(
                        PICKLE_PID,
                        ethers.utils.parseEther(stakeAmount),
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
        <Grid xs={24} md={12}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>Staked: {depositedStr}</div>
            <Link
              color
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setUnstakeAmount(formatEther(depositedNum));
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
                  recipient: PICKLE_ETH_SLP,
                  approval: false,
                  transferCallback: async () => {
                    return masterchefV2
                      .connect(signer)
                      .withdraw(
                        PICKLE_PID,
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
                    return masterchefV2
                      .connect(signer)
                      .harvest(PICKLE_PID, address);
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
