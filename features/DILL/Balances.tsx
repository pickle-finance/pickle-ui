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
          <h2>Locked (until {formatDate(unlockTime)})</h2>
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
      {/* <Grid xs={24} sm={12} md={8}>
        <Card>
          <h2>{rewardsTokenName} Earned</h2>
          <DataPoint>
            <span>
              {earned
                ? Number(formatEther(earned)).toLocaleString(undefined, {
                    minimumFractionDigits: 8,
                    maximumFractionDigits: 8,
                  })
                : "--"}
            </span>
            <Icon />
          </DataPoint>
        </Card>
      </Grid>
      <Grid xs={24} sm={12} md={8}>
        <Card>
          <h2>
            {rewardsTokenName} Reward Every {rewardsDurationInDays} Days
          </h2>
          <DataPoint>
            <span>
              {rewardForDuration
                ? Number(formatEther(rewardForDuration)).toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    },
                  )
                : "--"}
            </span>
            <Icon />
          </DataPoint>
        </Card>
      </Grid>
      <Grid xs={24} sm={24} md={8}>
        <Card>
          <h2>Current APY</h2>
          <DataPoint>
            <span>
              {APY
                ? (100 * APY).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "--"}
              %
            </span>
          </DataPoint>
        </Card>
      </Grid> */}
    </Grid.Container>
  );
};
