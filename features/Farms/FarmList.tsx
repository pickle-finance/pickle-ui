import { FC, useState } from "react";
import styled from "styled-components";
import { Spacer, Grid, Checkbox } from "@geist-ui/react";

import { FarmGroupCollapsible } from "./FarmGroupCollapsible";
import { FarmCollapsible } from "./FarmCollapsible";
import { UserFarms } from "../../containers/UserFarms";
import { Connection } from "../../containers/Connection";
import {
  PICKLE_ETH_FARM,
  SUSHI_JAR_FARM_MAP,
  UNI_JAR_FARM_MAP,
  CURVE_FARM_MAP,
} from "../../containers/Farms/farms";

const Container = styled.div`
  padding-top: 1.5rem;
`;

export const FarmList: FC = () => {
  const { signer } = Connection.useContainer();
  const { farmData } = UserFarms.useContainer();
  const [showInactive, setShowInactive] = useState<boolean>(false);

  if (!signer) {
    return <h2>Please connect wallet to continue</h2>;
  }

  if (!farmData) {
    return <h2>Loading...</h2>;
  }

  const activeFarms = farmData.filter((x) => x.apy !== 0);
  const inactiveFarms = farmData.filter((x) => x.apy === 0);

  const pickleFarm = activeFarms.find(
    (farm) => farm.depositToken.address == PICKLE_ETH_FARM,
  );

  const sushiFarms = activeFarms.filter(
    (farm) => SUSHI_JAR_FARM_MAP[farm.depositToken.address],
  );

  const uniFarms = activeFarms.filter(
    (farm) => UNI_JAR_FARM_MAP[farm.depositToken.address],
  );

  const curveFarms = activeFarms.filter(
    (farm) => CURVE_FARM_MAP[farm.depositToken.address],
  );

  const remainingFarms = activeFarms.filter(
    (farm) =>
      farm !== pickleFarm &&
      !sushiFarms.includes(farm) &&
      !uniFarms.includes(farm) &&
      !curveFarms.includes(farm),
  );

  return (
    <Container>
      <Grid.Container gap={1}>
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
      <h2>Active</h2>
      <Spacer y={1} />
      {pickleFarm && (
        <Grid.Container gap={1}>
          <FarmCollapsible farmData={pickleFarm} />
        </Grid.Container>
      )}
      <Grid.Container gap={1}>
        <FarmGroupCollapsible farmData={sushiFarms} category="SushiSwap" />
      </Grid.Container>
      <Grid.Container gap={1}>
        <FarmGroupCollapsible farmData={uniFarms} category="Uniswap" />
      </Grid.Container>
      <Grid.Container gap={1}>
        <FarmGroupCollapsible farmData={curveFarms} category="Curve" />
      </Grid.Container>
      <Grid.Container gap={1}>
        {remainingFarms.map((farm) => (
          <Grid xs={24} key={farm.poolIndex}>
            <FarmCollapsible farmData={farm} />
          </Grid>
        ))}
      </Grid.Container>
      <Spacer y={1} />
      <Grid.Container gap={1}>
        {showInactive && <h2>Inactive</h2>}
        {showInactive &&
          inactiveFarms.map((farm) => (
            <Grid xs={24} key={farm.poolIndex}>
              <FarmCollapsible farmData={farm} />
            </Grid>
          ))}
      </Grid.Container>
    </Container>
  );
};
