import { FC } from "react";

import { CreateLock } from "./Lock/CreateLock";
import { UseDillOutput } from "../../containers/Dill";
import { Card } from "@geist-ui/react";
import { IncreaseAmount } from "./Lock/IncreaseAmount";
import { IncreaseTime } from "./Lock/IncreaseTime";
import { Withdraw } from "./Lock/Withdraw";
import { getTimeEpoch } from "../../utils/date";

export const Interaction: FC<{
  dillStats: UseDillOutput;
}> = ({ dillStats }) => {
  return (
    <Card>
      <h2>Lock PICKLEs for DILL</h2>
      {!+(dillStats.lockedAmount?.toString() || 0) ? (
        <CreateLock dillStats={dillStats} />
      ) : (
        <>
          <IncreaseAmount dillStats={dillStats} />
          <IncreaseTime dillStats={dillStats} />
          {+(dillStats?.lockEndDate?.toString() || 0) < getTimeEpoch() && (
            <Withdraw dillStats={dillStats} />
          )}
        </>
      )}
    </Card>
  );
};
