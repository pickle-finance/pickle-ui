import { FC, useEffect, useState } from "react";
import { formatEther } from "ethers/lib/utils";
import { Spacer, Grid, Checkbox, Button, Input } from "@geist-ui/react";
import { withStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import { PercentageInput } from "../../components/PercentageInput";
import { GaugeCollapsible } from "./GaugeCollapsible";
import { UserGaugeData, UserGauges } from "../../containers/UserGauges";
import { Connection } from "../../containers/Connection";
import { TransactionStatus, useGaugeProxy } from "../../hooks/useGaugeProxy";
import { VoteCollapsible } from "./VoteCollapsible";
import { GaugeChartCollapsible } from "./GaugeChartCollapsible";
import { PICKLE_JARS } from "../../containers/Jars/jars";
import { JAR_ACTIVE, JAR_YEARN } from "../../containers/Jars/jars";
import { useJarData } from "../Jars/useJarData";
import { JarCollapsible } from "../Jars/JarCollapsible";
import { backgroundColor, pickleGreen } from "../../util/constants";

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
  const { jarData } = useJarData();
  const [showInactive, setShowInactive] = useState(false);
  const [showUserJars, setShowUserJars] = useState<boolean>(false);

  if (!signer) {
    return <h2>Please connect wallet to continue</h2>;
  }

  if (!jarData || !gaugeData) return <h2>Loading...</h2>;

  const isDisabledFarm = (depositToken: string) =>
    depositToken === PICKLE_JARS.pUNIBACDAI ||
    depositToken === PICKLE_JARS.pUNIBASDAI ||
    depositToken === PICKLE_JARS.pUNIETHLUSD;

  const activeGauges = gaugeData.filter(
    (x) => !isDisabledFarm(x.depositToken.address),
  );

  const activeJars = jarData.filter(
    (jar) =>
      JAR_ACTIVE[jar.depositTokenName] && !JAR_YEARN[jar.depositTokenName],
  );

  const inactiveJars = jarData.filter(
    (jar) => !JAR_ACTIVE[jar.depositTokenName],
  );

  const userJars = jarData.filter((jar) =>
    parseFloat(formatEther(jar.deposited)),
  );

  return (
    <>
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
          Show Your Jars
        </Grid>
      </Grid.Container>
      <h2>Current Weights</h2>
      <GaugeChartCollapsible gauges={activeGauges} />
      <h2>Vote</h2>
      <VoteCollapsible
        gauges={activeGauges.filter(
          (x) => x.depositToken.address != PICKLE_JARS.pSUSHIETHYVECRV,
        )}
      />
      <div
        css={{
          justifyContent: "space-between",
          display: "flex",
          alignItems: "center",
        }}
      >
        <h2>Active Jars</h2>
      </div>
      <Grid.Container gap={1}>
        {(showUserJars ? userJars : activeJars).map((jar) => {
          const gauge = gaugeData.find(
            (x) =>
              x.depositToken.address.toLowerCase() ===
              jar.jarContract.address.toLowerCase(),
          );

          return (
            <Grid xs={24} key={jar.name}>
              <JarCollapsible jarData={jar} gaugeData={gauge} />
            </Grid>
          );
        })}
      </Grid.Container>
      <Spacer y={1} />
      <Grid.Container gap={1}>
        {showInactive && <h2>Inactive</h2>}
        {showInactive &&
          inactiveJars.map((jar) => {
            const gauge = gaugeData.find(
              (x) =>
                x.depositToken.address.toLowerCase() ===
                jar.jarContract.address.toLowerCase(),
            );
            return (
              <Grid xs={24} key={jar.name}>
                <JarCollapsible jarData={jar} gaugeData={gauge} />
              </Grid>
            );
          })}
      </Grid.Container>
    </>
  );
};
