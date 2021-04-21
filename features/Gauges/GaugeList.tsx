import { FC, useEffect, useState } from "react";
import styled from "styled-components";
import { Spacer, Grid, Checkbox, Button, Input } from "@geist-ui/react";
import { PercentageInput } from "../../components/PercentageInput";
import { GaugeCollapsible } from "./GaugeCollapsible";
import { UserGaugeData, UserGauges } from "../../containers/UserGauges";
import { Connection } from "../../containers/Connection";
import { TransactionStatus, useGaugeProxy } from "../../hooks/useGaugeProxy";
import { VoteCollapsible } from "./VoteCollapsible";
import { GaugeChartCollapsible } from "./GaugeChartCollapsible";
import { PICKLE_JARS } from "../../containers/Jars/jars";

const Container = styled.div`
  padding-top: 1.5rem;
`;

interface Weights {
  [key: string]: number;
}

export const GaugeList: FC = () => {
  const { signer } = Connection.useContainer();
  const { gaugeData } = UserGauges.useContainer();
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [voteWeights, setVoteWeights] = useState<Weights>({});
  const { status: voteTxStatus, vote } = useGaugeProxy();

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

  const isDisabledFarm = (depositToken: string) =>
    depositToken === PICKLE_JARS.pUNIBACDAI ||
    depositToken === PICKLE_JARS.pUNIBASDAI;

  const activeGauges = gaugeData.filter((x) => !isDisabledFarm(x.depositToken.address));
  const inactiveGauges = gaugeData.filter((x) => false);

  const renderGauge = (gauge: UserGaugeData) => (
    <Grid xs={24} key={gauge.address}>
      <div css={{ display: "flex", alignItems: "center" }}>
        <GaugeCollapsible gaugeData={gauge} />
      </div>
    </Grid>
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
            size="medium"
            onChange={(e) => setShowInactive(e.target.checked)}
          >
            Show Inactive Farms
          </Checkbox>
        </Grid>
      </Grid.Container>
      <h2>Current Weights</h2>
      <GaugeChartCollapsible gauges={activeGauges} />
      <h2>Vote</h2>
      <VoteCollapsible gauges={activeGauges} />
      <div
        css={{
          justifyContent: "space-between",
          display: "flex",
          alignItems: "center",
        }}
      >
        <h2>Active Farms</h2>
      </div>
      <Grid.Container gap={1}>{activeGauges.map(renderGauge)}</Grid.Container>
      <Spacer y={1} />
      <Grid.Container gap={1}>
        {showInactive && <h2>Inactive Farms</h2>}
        {showInactive && inactiveGauges.map(renderGauge)}
      </Grid.Container>
    </>
  );
};
