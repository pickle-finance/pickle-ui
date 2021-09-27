import { FC, useState } from "react";
import { formatEther } from "ethers/lib/utils";
import { Spacer, Grid, Checkbox, Button, Input } from "@geist-ui/react";
import { withStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import { UserGaugeData, UserGauges } from "../../containers/UserGauges";
import { BProtocol } from "./BProtocol";
import { Connection } from "../../containers/Connection";
import { VoteCollapsible } from "./VoteCollapsible";
import { GaugeChartCollapsible } from "./GaugeChartCollapsible";
import { MC2Farm } from "../MasterchefV2/MC2Farm";
import { PICKLE_JARS } from "../../containers/Jars/jars";
import { JAR_ACTIVE, JAR_YEARN } from "../../containers/Jars/jars";
import { useJarData } from "./useJarData";
import { GaugeCollapsible } from "./GaugeCollapsible";
import { JarGaugeCollapsible } from "./JarGaugeCollapsible";
import { backgroundColor, pickleGreen } from "../../util/constants";
import { PICKLE_ETH_FARM } from "../../containers/Farms/farms";
import {
  JAR_GAUGE_MAP,
  PICKLE_ETH_GAUGE,
} from "../../containers/Gauges/gauges";
import { useUniPairDayData } from "../../containers/Jars/useUniPairDayData";
import { Jars } from "../../containers/Jars";
import { NETWORK_NAMES } from "containers/config";
import { UserJarData } from "containers/UserJars";
import { BigNumber } from "ethers";
import { Trans, useTranslation } from "next-i18next";

export interface UserGaugeDataWithAPY extends UserGaugeData {
  APYs: Array<JarApy>;
  totalAPY: number;
}

export interface JarApy {
  [k: string]: number;
}

interface Weights {
  [key: string]: number;
}

const GreenSwitch = withStyles({
  switchBase: {
    color: backgroundColor,
    "&$checked": {
      color: pickleGreen,
    },
    "&$checked + $track": {
      backgroundColor: pickleGreen,
    },
  },
  checked: {},
  track: {},
})(Switch);

export const GaugeList: FC = () => {
  const { signer, chainName } = Connection.useContainer();
  const { gaugeData } = UserGauges.useContainer();
  const { jarData } = useJarData();
  const [showInactive, setShowInactive] = useState(false);
  const [showUserJars, setShowUserJars] = useState<boolean>(false);
  const { getUniPairDayAPY } = useUniPairDayData();
  const { jars } = Jars.useContainer();
  const { t } = useTranslation("common");

  if (!signer) <h2>{t("connection.connectToContinue")}</h2>;

  if (!jarData || !gaugeData) return <h2>{t("connection.loading")}</h2>;

  const findGauge = (jar: UserJarData) =>
    gaugesWithAPY.find(
      (x) =>
        x.depositToken.address.toLowerCase() ===
        jar.jarContract.address.toLowerCase(),
    );

  const gaugesWithAPY = gaugeData.map((gauge) => {
    // Get Jar APY (if its from a Jar)
    let APYs: JarApy[] = [];
    const maybeJar = JAR_GAUGE_MAP[gauge.depositToken.address];
    if (jars && maybeJar) {
      const gaugeingJar = jars.filter((x) => x.jarName === maybeJar.jarName)[0];
      APYs = gaugeingJar?.APYs ? [...APYs, ...gaugeingJar.APYs] : APYs;
    }

    if (
      gauge.depositToken.address.toLowerCase() ===
      PICKLE_ETH_GAUGE.toLowerCase()
    ) {
      APYs = [...APYs, ...getUniPairDayAPY(PICKLE_ETH_GAUGE)];
    }

    const totalAPY = APYs.map((x) => {
      return Object.values(x).reduce(
        (acc, y) => acc + (isNaN(y) || y > 1e6 ? 0 : y),
        0,
      );
    }).reduce((acc, x) => acc + x, 0);

    return {
      ...gauge,
      APYs,
      totalAPY,
    };
  });

  const isDisabledFarm = (depositToken: string) =>
    depositToken === PICKLE_JARS.pUNIETHLUSD;

  const activeJars = jarData.filter(
    (jar) =>
      JAR_ACTIVE[jar.depositTokenName] && !JAR_YEARN[jar.depositTokenName],
  );

  const inactiveJars = jarData.filter(
    (jar) => !JAR_ACTIVE[jar.depositTokenName],
  );

  const yearnJars = jarData.filter((jar) => {
    const gauge = findGauge(jar);
    const activeAndYearn =
      JAR_ACTIVE[jar.depositTokenName] && JAR_YEARN[jar.depositTokenName];
    return showUserJars
      ? activeAndYearn &&
          (parseFloat(formatEther(jar.deposited)) ||
            parseFloat(formatEther(gauge?.staked || 0)))
      : activeAndYearn;
  });

  const userJars = jarData.filter((jar) => {
    const gauge = findGauge(jar);
    return (
      (parseFloat(formatEther(jar.deposited)) ||
        parseFloat(formatEther(gauge?.staked || 0))) &&
      !JAR_YEARN[jar.depositTokenName]
    );
  });

  const activeGauges = gaugesWithAPY
    .filter((x) => !isDisabledFarm(x.depositToken.address))
    .sort((a, b) => b.totalAPY + b.fullApy - (a.totalAPY + a.fullApy));

  const moveInArray = (arr: UserGaugeData[], from: number, to: number) => {
    var item = arr.splice(from, 1);

    if (!item.length) return;
    arr.splice(to, 0, item[0]);
  };

  const indexofPickleEth = activeGauges.findIndex(
    (x) => x.depositToken.address.toLowerCase() === PICKLE_ETH_GAUGE,
  );
  moveInArray(activeGauges, indexofPickleEth, 0);

  const PicklePower = (
    <Grid xs={24}>
      <GaugeCollapsible gaugeData={gaugesWithAPY[0]} />
    </Grid>
  );

  return (
    <>
      <h2>{t("farms.picklePower")}</h2>
      <MC2Farm />
      <Spacer y={1} />
      <Grid.Container>
        <Grid md={12}>
          <p>
            <Trans i18nKey="farms.intro">
              Jars auto-invest your deposit tokens and Farms earn you{" "}
              <strong>$PICKLEs</strong>.
              <br />
              Deposit & Stake to get into both. Hover over the displayed APY to
              see where the returns are coming from.
            </Trans>
          </p>
        </Grid>
        <Grid md={12} style={{ textAlign: "right" }}>
          <Checkbox
            checked={showInactive}
            color="green"
            size="medium"
            onChange={(e) => setShowInactive(e.target.checked)}
          >
            {t("farms.showInactive")}
          </Checkbox>{" "}
          <GreenSwitch
            style={{ top: "-2px" }}
            checked={showUserJars}
            onChange={() => setShowUserJars(!showUserJars)}
          />
          {t("farms.showMyJars")}
        </Grid>
      </Grid.Container>
      <h2>{t("gauges.currentWeights")}</h2>
      <GaugeChartCollapsible gauges={activeGauges} />
      <h2>{t("gauges.vote")}</h2>
      <VoteCollapsible
        gauges={activeGauges.filter(
          (x) =>
            x.depositToken.address != PICKLE_JARS.pSUSHIETHYVECRV &&
            x.depositToken.address.toLowerCase() != PICKLE_ETH_FARM &&
            x.depositToken.address != PICKLE_JARS.pMIMETH
        )}
      />
      <div
        css={{
          justifyContent: "space-between",
          display: "flex",
          alignItems: "center",
        }}
      >
        <h2>{t("farms.jarsAndFarms")}</h2>
      </div>
      <Grid.Container gap={1}>
        {chainName === NETWORK_NAMES.ETH && yearnJars.length > 0 && (
          <>
            {t("farms.poweredBy")}&nbsp;
            <a href="https://yearn.finance/" target="_">
              Yearn
            </a>
            &nbsp;⚡
            {yearnJars.map((jar, idx) => {
              const gauge = findGauge(jar);
              return (
                gauge && (
                  <Grid xs={24} key={jar.name}>
                    <JarGaugeCollapsible
                      jarData={jar}
                      gaugeData={gauge}
                      isYearnJar={true}
                    />
                    {idx === yearnJars.length - 1 && <Spacer y={1} />}
                  </Grid>
                )
              );
            })}
          </>
        )}
        {chainName === NETWORK_NAMES.ETH && (
          <BProtocol showUserJars={showUserJars} />
        )}
        {showUserJars
          ? gaugesWithAPY[0].staked.gt(BigNumber.from(0)) && PicklePower
          : PicklePower}

        {(showUserJars ? userJars : activeJars).map((jar) => {
          const gauge = findGauge(jar);

          return (
            <Grid xs={24} key={jar.name}>
              {gauge && <JarGaugeCollapsible jarData={jar} gaugeData={gauge} />}
            </Grid>
          );
        })}
      </Grid.Container>
      <Spacer y={1} />
      <Grid.Container gap={1}>
        {showInactive && <h2>{t("farms.inactive")}</h2>}
        {showInactive &&
          inactiveJars.map((jar) => {
            const gauge = findGauge(jar);
            return (
              <Grid xs={24} key={jar.name}>
                {gauge && (
                  <JarGaugeCollapsible jarData={jar} gaugeData={gauge} />
                )}
              </Grid>
            );
          })}
      </Grid.Container>
    </>
  );
};
