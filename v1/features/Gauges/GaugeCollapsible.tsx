import { ethers } from "ethers";
import styled from "styled-components";
import { useState, FC, useEffect } from "react";
import { Button, Link, Input, Grid, Spacer, Tooltip } from "@geist-ui/react";
import { formatEther, formatUnits } from "ethers/lib/utils";
import { Trans, useTranslation } from "next-i18next";

import { Connection } from "../../containers/Connection";
import { Contracts } from "../../containers/Contracts";
import { Jars } from "../../containers/Jars";
import { ERC20Transfer } from "../../containers/Erc20Transfer";
import Collapse from "../Collapsible/Collapse";
import { getProtocolData } from "../../util/api";
import { LpIcon, TokenIcon, MiniIcon } from "../../components/TokenIcon";
import { Gauge__factory as GaugeFactory } from "../../containers/Contracts/factories/Gauge__factory";
import { FARM_LP_TO_ICON } from "../Farms/FarmCollapsible";
import { useDill } from "../../containers/Dill";
import { useMigrate } from "../Farms/UseMigrate";
import { isYveCrvEthJarToken } from "../../containers/Jars/jars";
import { JarApy, UserGaugeDataWithAPY } from "./GaugeList";
import { useJarFarmMap, PICKLE_ETH_FARM } from "../../containers/Farms/farms";
import { PICKLE_POWER, getFormatString } from "./GaugeInfo";
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

const GAUGE_LP_TO_ICON = FARM_LP_TO_ICON;

const formatAPY = (apy: number) => {
  if (apy > 1e6) return "∞%";
  return apy.toFixed(2) + "%";
};

export const GaugeCollapsible: FC<{ gaugeData: UserGaugeDataWithAPY }> = ({ gaugeData }) => {
  const { jars } = Jars.useContainer();

  const {
    poolName,
    depositToken,
    depositTokenName,
    depositTokenDecimals,
    balance,
    staked,
    harvestable,
    usdPerToken,
    fullApy,
  } = gaugeData;

  const { pickleCore } = PickleCore.useContainer();
  const { t } = useTranslation("common");
  const { balance: dillBalance, totalSupply: dillSupply } = useDill();
  const jarFarmMap = useJarFarmMap();

  const stakedNum = parseFloat(formatUnits(staked, depositTokenDecimals));

  const stakedStr = stakedNum.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: stakedNum < 1 ? 8 : 4,
  });

  const balanceNum = parseFloat(formatUnits(balance, depositTokenDecimals));

  const balanceStr = balanceNum.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: balanceNum < 1 ? 8 : 2,
  });

  const {
    deposit,
    withdraw,
    migrateYvboost,
    depositYvboost,
    withdrawGauge,
    migratePickleEth,
    depositPickleEth,
  } = useMigrate(depositToken, 0, balance, staked);

  const valueStr = (stakedNum * usdPerToken).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const harvestableStr = parseFloat(formatEther(harvestable || 0)).toLocaleString();

  const {
    status: erc20TransferStatuses,
    transfer,
    getTransferStatus,
  } = ERC20Transfer.useContainer();
  const { signer, address, blockNum, chainName } = Connection.useContainer();
  const { setButtonStatus } = useButtonStatus();

  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");

  const [stakeButton, setStakeButton] = useState<ButtonStatus>({
    disabled: false,
    text: t("farms.approveAndStake"),
  });
  const [unstakeButton, setUnstakeButton] = useState<ButtonStatus>({
    disabled: false,
    text: t("farms.unstake"),
  });
  const [harvestButton, setHarvestButton] = useState<ButtonStatus>({
    disabled: false,
    text: t("farms.harvest"),
  });
  const [exitButton, setExitButton] = useState<ButtonStatus>({
    disabled: false,
    text: t("farms.harvestAndExit"),
  });

  const [tvlData, setTVLData] = useState();

  const [yvMigrateState, setYvMigrateState] = useState<string | null>(null);
  const [isSuccess, setSuccess] = useState<boolean>(false);

  const [pickleMigrateState, setPickleMigrateState] = useState<string | null>(null);

  const gauge = signer && GaugeFactory.connect(gaugeData.address, signer);

  let APYs: JarApy[] = [];

  const pickleAPYMin = fullApy * 100 * 0.4;
  const pickleAPYMax = fullApy * 100;

  const maybeJar = jarFarmMap[depositToken.address];
  if (jars && maybeJar) {
    const gaugeingJar = jars.filter((x) => x.jarName === maybeJar.jarName)[0];
    APYs = gaugeingJar?.APYs ? [...APYs, ...gaugeingJar.APYs] : APYs;
  }

  const dillRatio = +(dillSupply?.toString() || 0)
    ? +(dillBalance?.toString() || 0) / +(dillSupply?.toString() || 1)
    : 0;

  const _balance = stakedNum;
  const _derived = _balance * 0.4;
  const _adjusted = (gaugeData.totalSupply / 10 ** depositTokenDecimals) * dillRatio * 0.6;
  const pickleAPY = (pickleAPYMax * Math.min(_balance, _derived + _adjusted)) / _balance;
  const realAPY = gaugeData.totalAPY + pickleAPY;

  const pickleItem =
    pickleAPYMin === 0 || pickleAPYMax === 0
      ? []
      : [`pickle: ${formatAPY(pickleAPYMin)} ~ ${formatAPY(pickleAPYMax)}`];
  const apyRangeTooltipText = [
    ...pickleItem,
    ...gaugeData.APYs.map((x) => {
      const k = Object.keys(x)[0];
      const v = Object.values(x)[0];
      return isNaN(v) || v > 1e6 ? null : `${k}: ${v.toFixed(2)}%`;
    }),
  ]
    .filter((x) => x)
    .join(" + ");

  const yourPickles = pickleAPY === 0 ? [] : [`pickle: ${formatAPY(pickleAPY)}`];
  const yourApyTooltipText = [
    ...yourPickles,
    ...gaugeData.APYs.map((x) => {
      const k = Object.keys(x)[0];
      const v = Object.values(x)[0];
      return isNaN(v) || v > 1e6 ? null : `${k}: ${v.toFixed(2)}%`;
    }),
  ]
    .filter((x) => x)
    .join(" + ");

  const isyveCRVFarm = isYveCrvEthJarToken(depositToken.address);

  const isPickleFarm = depositToken.address.toLowerCase() === PICKLE_ETH_FARM;

  const handleYvboostMigrate = async () => {
    if (stakedNum || balanceNum) {
      try {
        setYvMigrateState(t("farms.withdrawingFromFarm"));
        await withdrawGauge(gauge);
        setYvMigrateState(t("farms.migratingTo", { target: "yvBOOST pJar" }));
        await migrateYvboost();
        setYvMigrateState(t("farms.migrated"));
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

  const handlePickleEthMigrate = async () => {
    if (stakedNum || balanceNum) {
      try {
        setPickleMigrateState(t("farms.withdrawingFromFarm"));
        await withdrawGauge(gauge);
        setPickleMigrateState(t("farms.migratingTo", { target: "Sushi LP" }));
        await migratePickleEth();
        setPickleMigrateState(t("farms.migratedMasterchef"));
        await depositPickleEth();
        setPickleMigrateState(null);
        setSuccess(true);
      } catch (error) {
        console.error(error);
        alert(error.message);
        setPickleMigrateState(null);
        return;
      }
    }
  };

  useEffect(() => {
    getProtocolData().then((info) => setTVLData(info));
  }, []);

  useEffect(() => {
    if (gaugeData) {
      const stakeStatus = getTransferStatus(depositToken.address, gaugeData.address);
      const unstakeStatus = getTransferStatus(gaugeData.address, depositToken.address);
      const harvestStatus = getTransferStatus(gaugeData.address, "harvest");
      const exitStatus = getTransferStatus(gaugeData.address, "exit");

      setButtonStatus(
        stakeStatus,
        t("farms.staking"),
        approved ? t("farms.stake") : t("farms.approveAndStake"),
        setStakeButton,
      );
      setButtonStatus(unstakeStatus, t("farms.unstaking"), t("farms.unstake"), setUnstakeButton);
      setButtonStatus(harvestStatus, t("farms.harvesting"), t("farms.harvest"), setHarvestButton);
      setButtonStatus(exitStatus, t("farms.exiting"), t("farms.harvestAndExit"), setExitButton);
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

  const tvlNum = tvlData ? tvlData[PICKLE_POWER] : 0;
  const tvlStr = getFormatString(tvlNum);

  return (
    <Collapse
      style={{ borderWidth: "1px", boxShadow: "none", flex: 1 }}
      shadow
      preview={
        <Grid.Container gap={1}>
          <Grid xs={24} sm={12} md={6} lg={6}>
            <TokenIcon
              src={GAUGE_LP_TO_ICON[depositToken.address as keyof typeof GAUGE_LP_TO_ICON]}
            />
            <div style={{ width: "100%" }}>
              <div style={{ fontSize: `1rem` }}>{poolName}</div>
              <Label style={{ fontSize: `1rem` }}>{depositTokenName}</Label>
            </div>
          </Grid>
          <Grid xs={24} sm={12} md={3} lg={3} css={{ textAlign: "center" }}>
            <Data isZero={balanceNum === 0}>{balanceStr}</Data>
            <Label>{t("balances.walletBalance")}</Label>
          </Grid>
          <Grid xs={24} sm={12} md={3} lg={3} css={{ textAlign: "center" }}>
            <Data isZero={parseFloat(formatEther(harvestable || 0)) === 0}>{harvestableStr}</Data>
            <Label>{t("balances.earned")}</Label>
          </Grid>
          <Grid xs={24} sm={6} md={4} lg={4} css={{ textAlign: "center" }}>
            <Data isZero={stakedNum * usdPerToken === 0}>${valueStr}</Data>
            <Label>{t("balances.depositValue")}</Label>
          </Grid>
          <Grid xs={24} sm={6} md={4} lg={4} css={{ textAlign: "center" }}>
            <>
              <Tooltip text={gaugeData.totalAPY + fullApy === 0 ? "--" : apyRangeTooltipText}>
                <div>
                  {gaugeData.totalAPY + fullApy === 0
                    ? "--%"
                    : `${formatAPY(gaugeData.totalAPY + pickleAPYMin)}~${formatAPY(
                        gaugeData.totalAPY + pickleAPYMax,
                      )}`}
                </div>
                <Label>{t("balances.apyRange")}</Label>
              </Tooltip>
              {Boolean(realAPY) && (
                <div>
                  <Tooltip
                    text={realAPY === 0 ? "--" : yourApyTooltipText}
                    style={{ marginTop: 5 }}
                  >
                    <div style={{ display: "flex" }}>
                      <Label>{t("balances.yourApy")}: </Label>
                      <div>{!realAPY ? "--%" : `${realAPY.toFixed(2)}%`}</div>
                    </div>
                  </Tooltip>
                </div>
              )}
            </>
          </Grid>
          <Grid xs={24} sm={12} md={4} lg={4} css={{ textAlign: "center" }}>
            <Data isZero={tvlNum === 0}>${tvlStr}</Data>
            <Label>{t("balances.tvl")}</Label>
          </Grid>
        </Grid.Container>
      }
    >
      <Spacer y={1} />
      <Grid.Container gap={2}>
        <Grid xs={24} md={stakedNum ? 12 : 24}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              {t("balances.balance")}: {balanceStr} {depositTokenName}
            </div>
            <Link
              color
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setStakeAmount(formatUnits(balance, depositTokenDecimals));
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
            disabled={stakeButton.disabled || isyveCRVFarm}
            onClick={() => {
              if (gauge && signer) {
                transfer({
                  token: depositToken.address,
                  recipient: gauge.address,
                  transferCallback: async () => {
                    return gauge.deposit(
                      ethers.utils.parseUnits(stakeAmount, depositTokenDecimals),
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
        {stakedNum !== 0 && (
          <Grid xs={24} md={12}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                {t("balances.staked")}: {stakedStr} {depositTokenName}
              </div>
              <Link
                color
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setUnstakeAmount(formatUnits(staked, depositTokenDecimals));
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
                if (gauge && signer) {
                  transfer({
                    token: gauge.address,
                    recipient: depositToken.address,
                    approval: false,
                    transferCallback: async () => {
                      return gauge.withdraw(
                        ethers.utils.parseUnits(unstakeAmount, depositTokenDecimals),
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
        )}
        <Spacer />
      </Grid.Container>
      <Grid.Container gap={2}>
        <Grid xs={24} md={24}>
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
            {harvestButton.text} {harvestableStr} $PICKLES
          </Button>
        </Grid>
        <Grid xs={24} md={24}>
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
                {yvMigrateState ||
                  t("farms.migrateFromTo", {
                    from: "yveCRV-ETH LP",
                    to: "yvBOOST-ETH LP",
                  })}
              </Button>
              <div
                style={{
                  width: "100%",
                  textAlign: "center",
                  fontFamily: "Source Sans Pro",
                  fontSize: "1rem",
                }}
              >
                <Trans i18nKey="farms.yvBOOSTMigration">
                  Your tokens will be unstaked and migrated to the yvBOOST pJar and staked in the
                  Farm.
                  <br />
                  This process will require a number of transactions.
                  <br />
                  Learn more about yvBOOST
                  <a target="_" href="https://twitter.com/iearnfinance/status/1388131568481411077">
                    here
                  </a>
                  .
                </Trans>
                {isSuccess && (
                  <p style={{ fontWeight: "bold" }}>
                    <Trans i18nKey="farms.migrationCompleted">
                      Migration completed! See your deposits
                      <Link color href="/farms">
                        here
                      </Link>
                    </Trans>
                  </p>
                )}
              </div>
            </>
          ) : null}
          {isPickleFarm ? (
            <>
              <Button
                disabled={pickleMigrateState !== null}
                onClick={handlePickleEthMigrate}
                style={{ width: "100%", textTransform: "none" }}
              >
                {pickleMigrateState || (
                  <Trans i18nKey="farms.migrateToSushi">
                    Migrate PICKLE-ETH to Sushi for dual
                    <MiniIcon source="/pickle.png" /> and
                    <MiniIcon source="/sushiswap.png" /> rewards
                  </Trans>
                )}
              </Button>
              <div
                style={{
                  width: "100%",
                  textAlign: "center",
                  fontFamily: "Source Sans Pro",
                  fontSize: "1rem",
                }}
              >
                <Trans i18nKey="farms.sushiMigration">
                  Your PICKLE/ETH LP tokens will be unstaked and migrated from Uniswap LP tokens to
                  Sushi LP tokens
                  <br /> and then staked in Sushi's MasterChef v2. This process will require a
                  number of transactions.
                </Trans>
                {isSuccess && (
                  <p style={{ fontWeight: "bold" }}>
                    <Trans i18nKey="farms.migrationCompleted">
                      Migration completed! See your deposits
                      <Link color href="/farms">
                        here
                      </Link>
                    </Trans>
                  </p>
                )}
              </div>
            </>
          ) : null}
        </Grid>
      </Grid.Container>
    </Collapse>
  );
};
