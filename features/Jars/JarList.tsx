import { FC, useState } from "react";
import styled from "styled-components";
import { Spacer, Grid, Checkbox } from "@geist-ui/react";

import { JarCollapsible } from "./JarCollapsible";
import { useJarData } from "./useJarData";
import { Connection } from "../../containers/Connection";
import { JAR_ACTIVE } from "../../containers/Jars/jars";

const Container = styled.div`
  padding-top: 1.5rem;
`;

export const JarList: FC = () => {
  const { signer } = Connection.useContainer();
  const { jarData } = useJarData();
  const [showInactive, setShowInactive] = useState(false);

  if (!signer) {
    return <h2>Please connect wallet to continue</h2>;
  }

  if (!jarData) return <h2>Loading...</h2>;
  const activeJars = jarData.filter((jar) => JAR_ACTIVE[jar.depositTokenName]);
  const inactiveJars = jarData.filter(
    (jar) => !JAR_ACTIVE[jar.depositTokenName],
  );
  console.log(activeJars, inactiveJars);

  return (
    <Container>
      <Grid.Container gap={1}>
        <Grid md={12}>
          <p>
            Put your tokens into a PickleJar and earn without losing your
            principal.
          </p>
        </Grid>
        <Grid md={12} style={{ textAlign: "right" }}>
          <Checkbox
            checked={showInactive}
            size="medium"
            onChange={(e) => setShowInactive(e.target.checked)}
          >
            Show Inactive Jars
          </Checkbox>
        </Grid>
      </Grid.Container>
      <Spacer y={1} />
      <Grid.Container gap={1}>
        {activeJars.map((jar) => (
          <Grid xs={24} key={jar.name}>
            <JarCollapsible jarData={jar} />
          </Grid>
        ))}
      </Grid.Container>
      <Spacer y={1} />
      <Grid.Container gap={1}>
        {showInactive && <h2>Inactive</h2>}
        {showInactive &&
          inactiveJars.map((jar) => (
            <Grid xs={24} key={jar.name}>
              <JarCollapsible jarData={jar} />
            </Grid>
          ))}
      </Grid.Container>
    </Container>
  );
};
