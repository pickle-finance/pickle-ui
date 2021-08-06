import { FC, useState } from "react";
import { formatEther } from "ethers/lib/utils";
import { Spacer, Grid, Checkbox } from "@geist-ui/react";
import { withStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import { GaugeCollapsible } from "./GaugeCollapsible";
import { UserGaugeData, UserGauges } from "../../containers/UserGauges";
import { Connection } from "../../containers/Connection";
import { useGaugeProxy } from "../../hooks/useGaugeProxy";
import { VoteCollapsible } from "./VoteCollapsible";
import { GaugeChartCollapsible } from "./GaugeChartCollapsible";
import { MC2Farm } from "../MasterchefV2/MC2Farm";
import { PICKLE_JARS } from "../../containers/Jars/jars";
import { backgroundColor, pickleGreen } from "../../util/constants";
import { PICKLE_ETH_FARM } from "../../containers/Farms/farms";
import {
  JAR_GAUGE_MAP,
  PICKLE_ETH_GAUGE,
} from "../../containers/Gauges/gauges";
import type { JarApy } from "../../containers/Jars/useJarsWithAPYEth";
import { useUniPairDayData } from "../../containers/Jars/useUniPairDayData";
import { Jars } from "../../containers/Jars";

export interface UserGaugeDataWithAPY extends UserGaugeData {
  APYs: Array<JarApy>;
  totalAPY: number;
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
  const { signer } = Connection.useContainer();
  const { gaugeData } = UserGauges.useContainer();
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [voteWeights, setVoteWeights] = useState<Weights>({});
  const { status: voteTxStatus, vote } = useGaugeProxy();
  const [showUserGauges, setShowUserGauges] = useState<boolean>(false);
  const { getUniPairDayAPY } = useUniPairDayData();
  const { jars } = Jars.useContainer();

  let totalGaugeWeight = 0;
  for (let i = 0; i < gaugeData?.length; i++) {
    totalGaugeWeight += voteWeights[gaugeData[i].address] || 0;
  }

  if (!signer) {
    return <h2>Please connect wallet to continue</h2>;
  }

  if (!gaugeData) {
    return <h2>Loading...</h2>;
  }

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

  const activeGauges = gaugesWithAPY
    .filter((x) => !isDisabledFarm(x.depositToken.address))
    .sort((a, b) => b.totalAPY + b.fullApy - (a.totalAPY + a.fullApy));
  const inactiveGauges = gaugesWithAPY.filter(
    (x) => false || isDisabledFarm(x.depositToken.address),
  );

  const moveInArray = (arr: UserGaugeData[], from: number, to: number) => {
    var item = arr.splice(from, 1);

    if (!item.length) return;
    arr.splice(to, 0, item[0]);
  };

  const indexofPickleEth = activeGauges.findIndex(
    (x) => x.depositToken.address.toLowerCase() === PICKLE_ETH_GAUGE,
  );
  moveInArray(activeGauges, indexofPickleEth, 0);

  const userGauges = gaugesWithAPY.filter((gauge) =>
    parseFloat(formatEther(gauge.staked)),
  );

  const renderGauge = (gauge: UserGaugeDataWithAPY) => (
    <Grid xs={24} key={gauge.address}>
      <div css={{ display: "flex", alignItems: "center" }}>
        <GaugeCollapsible gaugeData={gauge} />
      </div>
    </Grid>
  );

  return (
    <>
      <h2>Pickle Power</h2>
      <MC2Farm />
      <Spacer y={1} />
      <Grid.Container>
        <Grid md={12}>
          <p>
            Farms allow you to earn PICKLEs by staking tokens.
            <br />
            Hover over the displayed APY to see where the returns are coming
            from.
          </p>
        </Grid>
        <Grid md={12} style={{ textAlign: "right" }}>
          <Checkbox
            checked={showInactive}
            size="medium"
            onChange={(e) => setShowInactive(e.target.checked)}
          >
            Show Inactive Farms
          </Checkbox>{" "}
          <GreenSwitch
            style={{ top: "-2px" }}
            checked={showUserGauges}
            onChange={() => setShowUserGauges(!showUserGauges)}
          />
          Show Your Farms
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
        <h2>Active Farms</h2>
      </div>
      <Grid.Container gap={1}>
        {(showUserGauges ? userGauges : activeGauges).map(renderGauge)}
      </Grid.Container>
      <Spacer y={1} />
      <Grid.Container gap={1}>
        {showInactive && <h2>Inactive Farms</h2>}
        {showInactive && inactiveGauges.map(renderGauge)}
      </Grid.Container>
    </>
  );
};
