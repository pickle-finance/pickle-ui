import { FC } from "react";
import { Grid, Card } from "@geist-ui/react";
import styled from "styled-components";
import { formatEther } from "ethers/lib/utils";

import { useBalances } from "../Balances/useBalances";
import { Dill, UseDillOutput } from "../../containers/Dill";
import { formatDate } from "../../utils/date";

const DataPoint = styled.div`
  font-size: 24px;
  display: flex;
  align-items: center;
`;

const PickleIcon = ({ size = "24px", margin = "0 0 0 0.5rem" }) => (
  <img
    src="/pickle.png"
    alt="pickle"
    style={{
      width: size,
      margin,
      verticalAlign: `text-bottom`,
    }}
  />
);

export const Balances: FC<{
  dillStats: UseDillOutput;
}> = ({ dillStats }) => {
  const { pickleBalance } = useBalances();
  const { balance: dillBalance } = Dill.useContainer();
  console.log(dillStats.lockEndDate);

  const unlockTime = new Date();
  unlockTime.setTime(+(dillStats.lockEndDate?.toString() || 0) * 1000);
  const isLocked = Boolean(+(dillStats.lockEndDate?.toString() || 0) * 1000);

  return (
    <Grid.Container gap={2}>
      <Grid xs={24} sm={12} md={12}>
        <Card>
          <h2>PICKLE Balance</h2>
          <DataPoint>
            <span>
              {pickleBalance !== null
                ? Number(pickleBalance).toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 4,
                  })
                : "--"}
            </span>
            <PickleIcon />
          </DataPoint>
        </Card>
      </Grid>
      <Grid xs={24} sm={12} md={12}>
        <Card>
          <h2>
            {isLocked ? (
              <>Locked (until {formatDate(unlockTime)})</>
            ) : (
              "Unlocked"
            )}
          </h2>
          <DataPoint>
            <span>
              {dillStats.lockedAmount !== null
                ? Number(
                    formatEther(dillStats.lockedAmount?.toString() || "0"),
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 4,
                  })
                : "--"}
            </span>
            <PickleIcon />
            &nbsp;=&nbsp;
            <span>
              {pickleBalance !== null
                ? Number(
                    formatEther(dillBalance?.toString() || "0"),
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 4,
                  })
                : "--"}
            </span>
            &nbsp;DILL
          </DataPoint>
        </Card>
      </Grid>
    </Grid.Container>
  );
};
