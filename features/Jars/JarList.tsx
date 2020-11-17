import { FC } from "react";
import styled from "styled-components";
import { Spacer, Grid } from "@geist-ui/react";

import { JarCollapsible } from "./JarCollapsible";
import { useJarData } from "./useJarData";
import { Connection } from "../../containers/Connection";

const Container = styled.div`
  padding-top: 1.5rem;
`;

export const JarList: FC = () => {
  const { signer } = Connection.useContainer();
  const { jarData } = useJarData();

  if (!signer) {
    return <h2>Please connect wallet to continue</h2>;
  }

  if (!jarData) return <h2>Loading...</h2>;

  return (
    <Container>
      <p>
        Put your tokens into a PickleJar and earn without losing your principal.
      </p>
      <Spacer y={2} />
      <Grid.Container gap={1}>
        {jarData.map((jar) => (
          <Grid xs={24} key={jar.name}>
            <JarCollapsible jarData={jar} />
          </Grid>
        ))}
      </Grid.Container>
    </Container>
  );
};
