import { FC, useState } from "react";
import styled from "styled-components";
import { Spacer, Grid, Checkbox, Button } from "@geist-ui/react";

import { MiniFarmCollapsible } from "../MiniFarms/MiniFarmCollapsible";
import { UserMiniFarms } from "../../containers/UserMiniFarms";
import { Connection } from "../../containers/Connection";
import { MiniIcon } from "../../components/TokenIcon";
import { PICKLE_JARS } from "../../containers/Jars/jars";
import { NETWORK_NAMES } from "containers/config";

const Container = styled.div`
  padding-top: 1.5rem;
`;

export const MiniFarmList: FC = () => {
  const { signer, chainName } = Connection.useContainer();
  const { farmData } = UserMiniFarms.useContainer();
  const [showInactive, setShowInactive] = useState<boolean>(false);

  if (!signer) {
    return <h2>Please connect wallet to continue</h2>;
  }

  if (!farmData) {
    return <h2>Loading...</h2>;
  }

  const inactiveFarms = farmData.filter((x) => x.apy === 0);

  return (
    <Container>
      <Grid.Container gap={1}>
        <Grid md={16}>
          <p>
            Farms allow you to earn dual PICKLE <MiniIcon source="/pickle.png" />{" "}
            and MATIC <MiniIcon source={"/matic.png"} /> rewards by staking tokens.
            <br />
            Hover over the displayed APY to see where the returns are coming
            from.
          </p>
        </Grid>
        <Grid md={8} style={{ textAlign: "right" }}>
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
        {farmData.map((farm) => (
          <>
            <Grid xs={24} key={farm.poolIndex}>
              <MiniFarmCollapsible farmData={farm} />
            </Grid>
          </>
        ))}
      </Grid.Container>
      <Spacer y={1} />
      <Grid.Container gap={1}>
        {showInactive && <h2>Inactive</h2>}
        {showInactive &&
          inactiveFarms.map((farm) => (
            <Grid xs={24} key={farm.poolIndex}>
              <MiniFarmCollapsible farmData={farm} />
            </Grid>
          ))}
      </Grid.Container>
    </Container>
  );
};
