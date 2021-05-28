import { FC } from "react";

import { CreateLock } from "./Lock/CreateLock";
import { UseDillOutput } from "../../containers/Dill";
import { Card, Grid } from "@geist-ui/react";
import { IncreaseAmount } from "./Lock/IncreaseAmount";
import { IncreaseTime } from "./Lock/IncreaseTime";
import { LockDurationChart } from "./Lock/LockDurationChart";
import { Withdraw } from "./Lock/Withdraw";

export const Interaction: FC<{
  dillStats: UseDillOutput;
}> = ({ dillStats }) => {
  const unlockTime = new Date();
  unlockTime.setTime(+(dillStats.lockEndDate?.toString() || 0) * 1000);
  const isExpired = unlockTime < new Date();

  return (
    <Card>
      <h2>Lock PICKLEs for DILL</h2>
      <Grid.Container gap={2}>
        <Grid xs={24} sm={10}>
          <LockDurationChart dillStats={dillStats} />
        </Grid>
        <Grid xs={24} sm={14}>
          {!+(dillStats.lockedAmount?.toString() || 0) ? (
            <CreateLock dillStats={dillStats} />
          ) : isExpired ? (
            <Withdraw dillStats={dillStats} />
          ) : (
            <>
              <IncreaseAmount dillStats={dillStats} />
              <IncreaseTime dillStats={dillStats} />
            </>
          )}
        </Grid>
      </Grid.Container>
    </Card>
  );
};
