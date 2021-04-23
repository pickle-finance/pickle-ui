import { FC, useState } from "react";
import styled from "styled-components";
import { Spacer, Grid, Checkbox, Button } from "@geist-ui/react";

import { FarmCollapsible } from "./FarmCollapsible";
import { UserFarms } from "../../containers/UserFarms";
import { Connection } from "../../containers/Connection";

const Container = styled.div`
  padding-top: 1.5rem;
`;

export const FarmList: FC = () => {
  const { signer } = Connection.useContainer();
  const { farmData } = UserFarms.useContainer();
  const [showInactive, setShowInactive] = useState<boolean>(true);

  if (!signer) {
    return <h2>Please connect wallet to continue</h2>;
  }

  if (!farmData) {
    return <h2>Loading...</h2>;
  }

  const activeFarms = farmData.filter((x) => x.apy !== 0);
  const inactiveFarms = farmData.filter((x) => x.apy === 0);

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
      <Spacer y={0.5} />
      <Grid.Container gap={1}>
        {activeFarms.map((farmData) => (
          <>
            <Grid xs={24} key={farmData.poolIndex}>
              <FarmCollapsible farmData={farmData} />
            </Grid>
          </>
        ))}
      </Grid.Container>
      <Spacer y={1} />
      <Grid.Container gap={1}>
        {showInactive && <h2>Inactive</h2>}
        {showInactive &&
          inactiveFarms.map((farmData) => (
            <Grid xs={24} key={farmData.poolIndex}>
              <FarmCollapsible farmData={farmData} />
            </Grid>
          ))}
      </Grid.Container>
    </Container>
  );
};
