import { FC } from "react";
import { Grid, Card } from "@geist-ui/react";
import styled from "styled-components";
import { formatEther } from "ethers/lib/utils";

import { UseStakingRewardsOutput } from "../../containers/Staking/useStakingRewards";
import { useBalances } from "../Balances/useBalances";

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

const CRVIcon = ({ size = "24px", margin = "0 0 0 0.5rem" }) => (
  <img
    src="/sCRV.png"
    alt="sCRV"
    style={{
      width: size,
      margin,
      verticalAlign: `text-bottom`,
    }}
  />
);

const WETHIcon = ({ size = "24px", margin = "0 0 0 0.5rem" }) => (
  <img
    src="/weth.png"
    alt="weth"
    style={{
      width: size,
      margin,
      verticalAlign: `text-bottom`,
    }}
  />
);

const ICON_MAPPING = {
  weth: WETHIcon,
  scrv: CRVIcon,
};

export const Balances: FC<{
  stakingRewards: UseStakingRewardsOutput;
  rewardsTokenName: string;
}> = ({ stakingRewards, rewardsTokenName }) => {
  const { pickleBalance } = useBalances();
  const {
    APY,
    staked,
    earned,
    rewardsDurationInDays,
    rewardForDuration,
  } = stakingRewards;

  const Icon =
    ICON_MAPPING[rewardsTokenName.toLowerCase() as keyof typeof ICON_MAPPING];

  return (
    <Grid.Container gap={2}>
      <Grid xs={24} sm={12} md={12}>
        <Card>
          <h2>Balance</h2>
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
          <h2>Staked</h2>
          <DataPoint>
            <span>
              {staked !== null
                ? Number(formatEther(staked)).toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 4,
                  })
                : "--"}
            </span>
            <PickleIcon />
          </DataPoint>
        </Card>
      </Grid>
      <Grid xs={24} sm={12} md={8}>
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
      </Grid>
    </Grid.Container>
  );
};
