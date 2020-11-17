import { FC } from "react";
import { Grid } from "@geist-ui/react";

import { Info } from "./Info";
import { Deposit } from "./Deposit";
import { Withdraw } from "./Withdraw";

export const Zap: FC = () => {
  return (
    <>
      <Grid.Container gap={2}>
        <Grid xs={24} sm={24} md={24}>
          <Info />
        </Grid>
        <Grid xs={24} sm={24} md={12}>
          <Deposit />
        </Grid>
        <Grid xs={24} sm={24} md={12}>
          <Withdraw />
        </Grid>
      </Grid.Container>
    </>
  );
};
