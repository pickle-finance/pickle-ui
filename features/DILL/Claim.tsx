import { FC } from "react";
import { Grid, Card } from "@geist-ui/react";
import styled from "styled-components";
import { formatEther } from "ethers/lib/utils";
import { useProtocolIncome } from "../../containers/useProtocolIncome";

export const Claim: FC = () => {
  const { weeklyIncome } = useProtocolIncome();
  return (
    <Grid.Container gap={2}>
      <Grid xs={24} sm={12} md={12}>
        <Card>
          <h2>Weekly Income: {weeklyIncome}</h2>
        </Card>
      </Grid>
    </Grid.Container>
  );
};
