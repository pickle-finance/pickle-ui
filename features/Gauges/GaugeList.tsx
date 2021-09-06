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

  if (!signer) {
    return <h2>Please connect wallet to continue</h2>;
  }

  if (!jarData || !gaugeData) return <h2>Loading...</h2>;

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

  console.log(activeJars)

  const inactiveJars = jarData.filter(
    (jar) => !JAR_ACTIVE[jar.depositTokenName],
  );

  const yearnJars = jarData.filter((jar) => {
    const activeAndYearn =
      JAR_ACTIVE[jar.depositTokenName] && JAR_YEARN[jar.depositTokenName];
    return showUserJars
      ? activeAndYearn && parseFloat(formatEther(jar.deposited))
      : activeAndYearn;
  });

  const userJars = jarData.filter((jar) =>
    parseFloat(formatEther(jar.deposited)) && !JAR_YEARN[jar.depositTokenName]
  );

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

  const findGauge = (jar: UserJarData) =>
    gaugesWithAPY.find(
      (x) =>
        x.depositToken.address.toLowerCase() ===
        jar.jarContract.address.toLowerCase(),
    );

  return (
    <>
      <h2>Pickle Power</h2>
      <MC2Farm />
      <Spacer y={1} />
      <Grid.Container>
        <Grid md={12}>
          <p>
            Jars auto-invest your deposit tokens and Farms earn you{" "}
            <b>$PICKLEs</b>.
            <br />
            Deposit & Stake to get into both. Hover over the displayed APY to
            see where the returns are coming from.
          </p>
        </Grid>
        <Grid md={12} style={{ textAlign: "right" }}>
          <Checkbox
            checked={showInactive}
            color="green"
            size="medium"
            onChange={(e) => setShowInactive(e.target.checked)}
          >
            Show Inactive Jars
          </Checkbox>{" "}
          <GreenSwitch
            style={{ top: "-2px" }}
            checked={showUserJars}
            onChange={() => setShowUserJars(!showUserJars)}
          />
          Show My Jars
        </Grid>
      </Grid.Container>
      <h2>Current Weights</h2>
      <GaugeChartCollapsible gauges={activeGauges} />
      <h2>Vote</h2>
      <VoteCollapsible
        gauges={activeGauges.filter(
          (x) =>
            x.depositToken.address != PICKLE_JARS.pSUSHIETHYVECRV &&
            x.depositToken.address.toLowerCase() != PICKLE_ETH_FARM,
        )}
      />
      <div
        css={{
          justifyContent: "space-between",
          display: "flex",
          alignItems: "center",
        }}
      >
        <h2>Jars & Farms</h2>
      </div>
      <Grid.Container gap={1}>
        {chainName === NETWORK_NAMES.ETH && yearnJars.length > 0 && (
          <>
            Powered by&nbsp;
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
        <Grid xs={24}>
          <GaugeCollapsible gaugeData={gaugesWithAPY[0]} />
        </Grid>
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
        {showInactive && <h2>Inactive</h2>}
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
