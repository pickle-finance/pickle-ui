import { ethers } from "ethers";
import styled from "styled-components";
import { useState, FC, useEffect } from "react";
import {
  Button,
  Link,
  Input,
  Grid,
  Spacer,
  Tooltip,
  Checkbox,
} from "@geist-ui/react";
import { formatEther } from "ethers/lib/utils";

import {
  JAR_GAUGE_MAP,
  PICKLE_ETH_GAUGE,
} from "../../containers/Gauges/gauges";
import { UserGaugeData } from "../../containers/UserGauges";
import { Connection } from "../../containers/Connection";
import { Contracts } from "../../containers/Contracts";
import { Jars } from "../../containers/Jars";
import {
  ERC20Transfer,
  Status as ERC20TransferStatus,
} from "../../containers/Erc20Transfer";
import Collapse from "../Collapsible/Collapse";
import { JarApy } from "../../containers/Jars/useJarsWithAPY";
import { useUniPairDayData } from "../../containers/Jars/useUniPairDayData";
import { LpIcon, TokenIcon } from "../../components/TokenIcon";
import { GaugeFactory } from "../../containers/Contracts/GaugeFactory";
import { FARM_LP_TO_ICON } from "../Farms/FarmCollapsible";
import { useDill } from "../../containers/Dill";
import { useMigrate } from "../Farms/UseMigrate";
import { PICKLE_JARS } from "../../containers/Jars/jars";

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

const GAUGE_LP_TO_ICON = FARM_LP_TO_ICON;

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

const formatAPY = (apy: number) => {
  if (apy === Number.POSITIVE_INFINITY) return "∞%";
  return apy.toFixed(2) + "%";
};

export const GaugeCollapsible: FC<{ gaugeData: UserGaugeData }> = ({
  gaugeData,
}) => {
  const { jars } = Jars.useContainer();

  const {
    poolName,
    depositToken,
    depositTokenName,
    balance,
    staked,
    harvestable,
    usdPerToken,
    fullApy,
  } = gaugeData;
  const { balance: dillBalance, totalSupply: dillSupply } = useDill();
  const stakedNum = parseFloat(formatEther(staked));
  const balanceNum = parseFloat(formatEther(balance));
  const { deposit, withdraw, migrateYvboost, depositYvboost, withdrawGauge } = useMigrate(
    depositToken,
    0,
    balance,
    staked,
  );
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
  const { signer, address, blockNum } = Connection.useContainer();

  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");

  const [stakeButton, setStakeButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Approve and Stake",
  });
  const [unstakeButton, setUnstakeButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Unstake",
  });
  const [harvestButton, setHarvestButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Harvest",
  });
  const [exitButton, setExitButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Harvest and Exit",
  });

  const [yvMigrateState, setYvMigrateState] = useState<string | null>(null);
  const [isSuccess, setSuccess] = useState<boolean>(false);

  const gauge = signer && GaugeFactory.connect(gaugeData.address, signer);

  // Get Jar APY (if its from a Jar)
  let APYs: JarApy[] = [];
  const pickleAPYMin = fullApy * 100 * 0.4;
  const pickleAPYMax = fullApy * 100;

  const maybeJar =
    JAR_GAUGE_MAP[depositToken.address as keyof typeof JAR_GAUGE_MAP];
  if (jars && maybeJar) {
    const gaugeingJar = jars.filter((x) => x.jarName === maybeJar.jarName)[0];
    APYs = gaugeingJar?.APYs ? [...APYs, ...gaugeingJar.APYs] : APYs;
  }

  const { getUniPairDayAPY } = useUniPairDayData();
  if (depositToken.address.toLowerCase() === PICKLE_ETH_GAUGE.toLowerCase()) {
    APYs = [...APYs, ...getUniPairDayAPY(PICKLE_ETH_GAUGE)];
  }

  const totalAPY = APYs.map((x) => {
    return Object.values(x).reduce((acc, y) => acc + y, 0);
  }).reduce((acc, x) => acc + x, 0);
  const dillRatio = +(dillSupply?.toString() || 0)
    ? +(dillBalance?.toString() || 0) / +(dillSupply?.toString() || 1)
    : 0;

  const _balance = stakedNum;
  const _derived = _balance * 0.4;
  const _adjusted = (gaugeData.totalSupply / 10 ** 18) * dillRatio * 0.6;
  const pickleAPY =
    (pickleAPYMax * Math.min(_balance, _derived + _adjusted)) / _balance;
  const realAPY = totalAPY + pickleAPY;

  const apyRangeTooltipText = [
    `pickle: ${formatAPY(pickleAPYMin)} ~ ${formatAPY(pickleAPYMax)}`,
    ...APYs.map((x) => {
      const k = Object.keys(x)[0];
      const v = Object.values(x)[0];
      return `${k}: ${v.toFixed(2)}%`;
    }),
  ].join(" + ");
  const yourApyTooltipText = [
    `pickle: ${formatAPY(pickleAPY)}`,
    ...APYs.map((x) => {
      const k = Object.keys(x)[0];
      const v = Object.values(x)[0];
      return `${k}: ${v.toFixed(2)}%`;
    }),
  ].join(" + ");

  const isyveCRVFarm =
    depositToken.address.toLowerCase() ===
    PICKLE_JARS.pSUSHIETHYVECRV.toLowerCase();

  const handleYvboostMigrate = async () => {
    if (stakedNum || balanceNum) {
      try {
        setYvMigrateState("Withdrawing from Farm...");
        await withdrawGauge(gauge);
        setYvMigrateState("Migrating to yvBOOST pJar...");
        await migrateYvboost();
        setYvMigrateState("Migrated! Staking in Farm...");
        await depositYvboost();
        setYvMigrateState(null);
        setSuccess(true);
      } catch (error) {
        console.error(error);
        alert(error.message);
        setYvMigrateState(null);
        return;
      }
    }
  };

  useEffect(() => {
    if (gaugeData) {
      const stakeStatus = getTransferStatus(
        depositToken.address,
        gaugeData.address,
      );
      const unstakeStatus = getTransferStatus(
        gaugeData.address,
        depositToken.address,
      );
      const harvestStatus = getTransferStatus(gaugeData.address, "harvest");
      const exitStatus = getTransferStatus(gaugeData.address, "exit");

      setButtonStatus(
        stakeStatus,
        "Staking...",
        approved ? "Stake" : "Approve and Stake",
        setStakeButton,
      );
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
      setButtonStatus(
        exitStatus,
        "Exiting...",
        "Harvest and Exit",
        setExitButton,
      );
    }
  }, [erc20TransferStatuses]);

  const { erc20 } = Contracts.useContainer();
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    const checkAllowance = async () => {
      if (erc20 && address && signer) {
        const Token = erc20.attach(depositToken.address).connect(signer);
        const allowance = await Token.allowance(address, gaugeData.address);
        if (allowance.gt(ethers.constants.Zero)) {
          setApproved(true);
        }
      }
    };
    checkAllowance();
  }, [blockNum, address, erc20]);

  return (
    <Collapse
      style={{ borderWidth: "1px", boxShadow: "none", flex: 1 }}
      shadow
      preview={
        <Grid.Container gap={1}>
          <Grid xs={24} sm={12} md={6} lg={6}>
            <TokenIcon
              src={
                GAUGE_LP_TO_ICON[
                  depositToken.address as keyof typeof GAUGE_LP_TO_ICON
                ]
              }
            />
            <div style={{ width: "100%" }}>
              <div style={{ fontSize: `1rem` }}>{poolName}</div>
              <Label style={{ fontSize: `1rem` }}>{depositTokenName}</Label>
            </div>
          </Grid>
          <Grid xs={24} sm={6} md={4} lg={4} css={{ textAlign: "center" }}>
            <Tooltip
              text={totalAPY + fullApy === 0 ? "--" : apyRangeTooltipText}
            >
              <div>
                {totalAPY + fullApy === 0
                  ? "--%"
                  : `${formatAPY(totalAPY + pickleAPYMin)}~${formatAPY(
                      totalAPY + pickleAPYMax,
                    )}`}
              </div>
              <Label>APY Range</Label>
            </Tooltip>
          </Grid>
          <Grid xs={24} sm={6} md={3} lg={3} css={{ textAlign: "center" }}>
            <Tooltip text={realAPY === 0 ? "--" : yourApyTooltipText}>
              <div>{!realAPY ? "--%" : `${realAPY.toFixed(2)}%`}</div>
              <Label>Your APY</Label>
            </Tooltip>
          </Grid>
          <Grid xs={24} sm={6} md={2} lg={2} css={{ textAlign: "center" }}>
            <Data isZero={parseFloat(formatEther(harvestable || 0)) === 0}>
              {harvestableStr}
            </Data>
            <Label>Earned</Label>
          </Grid>
          <Grid xs={24} sm={6} md={2.5} lg={2.5} css={{ textAlign: "center" }}>
            <Data isZero={bal === 0}>{balStr}</Data>
            <Label>Balance</Label>
          </Grid>
          <Grid xs={24} sm={6} md={2.5} lg={2.5} css={{ textAlign: "center" }}>
            <Data isZero={stakedNum === 0}>{stakedStr}</Data>
            <Label>Staked</Label>
          </Grid>
          <Grid xs={24} sm={6} md={3} lg={3} css={{ textAlign: "center" }}>
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
            disabled={stakeButton.disabled || isyveCRVFarm}
            onClick={() => {
              if (gauge && signer) {
                transfer({
                  token: depositToken.address,
                  recipient: gauge.address,
                  transferCallback: async () => {
                    return gauge.deposit(ethers.utils.parseEther(stakeAmount));
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
              if (gauge && signer) {
                transfer({
                  token: gauge.address,
                  recipient: depositToken.address,
                  approval: false,
                  transferCallback: async () => {
                    return gauge.withdraw(
                      ethers.utils.parseEther(unstakeAmount),
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
      </Grid.Container>
      <Grid.Container gap={2}>
        <Grid xs={24} md={12}>
          <Button
            disabled={harvestButton.disabled}
            onClick={() => {
              if (gauge && signer) {
                transfer({
                  token: gauge.address,
                  recipient: gauge.address, // Doesn't matter since we don't need approval
                  approval: false,
                  transferCallback: async () => {
                    return gauge.getReward();
                  },
                });
              }
            }}
            style={{ width: "100%" }}
          >
            {harvestButton.text}
          </Button>
        </Grid>
        <Grid xs={24} md={12}>
          <Button
            disabled={harvestButton.disabled}
            onClick={() => {
              if (gauge && signer) {
                transfer({
                  token: gauge.address,
                  recipient: gauge.address, // Doesn't matter since we don't need approval
                  approval: false,
                  transferCallback: async () => {
                    return gauge.exit();
                  },
                });
              }
            }}
            style={{ width: "100%" }}
          >
            {exitButton.text}
          </Button>
        </Grid>

        <Grid xs={24}>
          {isyveCRVFarm ? (
            <>
              <Button
                disabled={yvMigrateState !== null}
                onClick={handleYvboostMigrate}
                style={{ width: "100%", textTransform: "none" }}
              >
                {yvMigrateState || "Migrate yveCRV-ETH LP to yvBOOST-ETH LP"}
              </Button>
              <div
                style={{
                  width: "100%",
                  textAlign: "center",
                  fontFamily: "Source Sans Pro",
                  fontSize: "1rem",
                }}
              >
                Your tokens will be unstaked and migrated to the yvBOOST pJar
                and staked in the Farm.<br />
                This process will require a number of transactions.
                {isSuccess ? (
                  <p style={{ fontWeight: "bold" }}>
                    Migration completed! See your deposits{" "}
                    <Link color href="/farms">
                      here
                    </Link>
                  </p>
                ) : null}
              </div>
            </>
          ) : null}
        </Grid>
      </Grid.Container>
    </Collapse>
  );
};
