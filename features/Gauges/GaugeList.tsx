import { FC, useEffect, useState } from "react";
import styled from "styled-components";
import { Spacer, Grid, Checkbox, Button, Input } from "@geist-ui/react";
import { PercentageInput } from "../../components/PercentageInput";
import { GaugeCollapsible } from "./GaugeCollapsible";
import { UserGaugeData, UserGauges } from "../../containers/UserGauges";
import { Connection } from "../../containers/Connection";
import { TransactionStatus, useGaugeProxy } from "../../hooks/useGaugeProxy";

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

  const weightsValid = totalGaugeWeight === 100;

  if (!signer) {
    return <h2>Please connect wallet to continue</h2>;
  }

  if (!gaugeData) {
    return <h2>Loading...</h2>;
  }

  const activeGauges = gaugeData.filter((x) => true);
  const inactiveGauges = gaugeData.filter((x) => false);

  const renderGauge = (gauge: UserGaugeData) => (
    <Grid xs={24} key={gauge.address}>
      <div css={{ display: "flex", alignItems: "center" }}>
        <GaugeCollapsible gaugeData={gauge} />
        <PercentageInput
          placeholder="0%"
          css={{
            width: "60px !important",
            minWidth: 0,
            marginLeft: 30,
          }}
          onValueChange={({ floatValue }) => {
            setVoteWeights({
              ...voteWeights,
              [gauge.address]: floatValue,
            });
          }}
        />
      </div>
    </Grid>
  );

  const handleBoost = () => {
    const tokens: string[] = [];
    const weights: number[] = [];

    if (!gaugeData) return;
    for (let i = 0; i < gaugeData.length; i++) {
      tokens.push(gaugeData[i].depositToken.address);
      weights.push(voteWeights[gaugeData[i].address]);
    }

    vote(tokens, weights);
  };

  return (
    <Container>
      <Grid.Container gap={1}>
        <Grid md={12}>
          <p>
            Gauges allow you to earn PICKLEs by staking tokens.
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
            Show Inactive Gauges
          </Checkbox>
        </Grid>
      </Grid.Container>
      <Spacer y={0.5} />
      <div
        css={{
          justifyContent: "space-between",
          display: "flex",
          alignItems: "center",
        }}
      >
        <h2>Active</h2>
        <Button
          size="small"
          css={{ width: "80px !important", minWidth: "0 !important" }}
          disabled={!weightsValid || voteTxStatus === TransactionStatus.Pending}
          onClick={handleBoost}
        >
          Boost
        </Button>
      </div>
      <Grid.Container gap={1}>{activeGauges.map(renderGauge)}</Grid.Container>
      <Spacer y={1} />
      <Grid.Container gap={1}>
        {showInactive && <h2>Inactive</h2>}
        {showInactive && inactiveGauges.map(renderGauge)}
      </Grid.Container>
    </Container>
  );
};
