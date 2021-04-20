import { FC } from "react";
import { Grid, Card } from "@geist-ui/react";
import styled from "styled-components";
import { formatEther } from "ethers/lib/utils";

import { useBalances } from "../Balances/useBalances";
import { Dill, UseDillOutput } from "../../containers/Dill";
import { formatDate } from "../../util/date";

const DataPoint = styled.div`
  font-size: 22px;
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

  const unlockTime = new Date();
  unlockTime.setTime(+(dillStats.lockEndDate?.toString() || 0) * 1000);
  const isLocked = Boolean(+(dillStats.lockEndDate?.toString() || 0));
  const isExpired = unlockTime < new Date();

  return (
    <Grid.Container gap={2}>
      <Grid xs={24} sm={5} md={5}>
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
      <Grid xs={24} sm={10} md={10}>
        <Card>
          <h2>
            {isLocked ? (
              isExpired ? (
                <>Expired (since {formatDate(unlockTime)})</>
              ) : (
                <>Locked (until {formatDate(unlockTime)})</>
              )
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
                    maximumFractionDigits: 2,
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
                    maximumFractionDigits: 2,
                  })
                : "--"}
            </span>
            &nbsp;DILL
          </DataPoint>
        </Card>
      </Grid>
      <Grid xs={24} sm={9} md={9}>
        <Card>
          <h2>Total Locked</h2>
          <DataPoint>
            <span>
              {pickleBalance !== null
                ? Number(
                    formatEther(dillStats.totalLocked?.toString() || "0"),
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })
                : "--"}
            </span>
            <PickleIcon />
            &nbsp;=&nbsp;
            <span>
              ${pickleBalance !== null
                ? Number(
                    dillStats.lockedValue?.toString() || "0",
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })
                : "--"}
            </span>
          </DataPoint>
        </Card>
      </Grid>
    </Grid.Container>
  );
};
