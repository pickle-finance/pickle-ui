import { FC } from "react";
import { Grid, Card } from "@geist-ui/react";
import styled from "styled-components";
import { formatEther } from "ethers/lib/utils";

import { useBalances } from "../Balances/useBalances";
import { DillStats } from "./DillStats";
import { UseDillOutput } from "../../containers/Dill";
import PickleIcon from "../../components/PickleIcon";

const DataPoint = styled.div`
  font-size: 22px;
  display: flex;
  align-items: center;
`;

export const Balances: FC<{
  dillStats: UseDillOutput;
}> = ({ dillStats }) => {
  const { pickleBalance } = useBalances();

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
                    maximumFractionDigits: 2,
                  })
                : "--"}
            </span>
            <PickleIcon size={24} margin="0 0 0 0.5rem" />
          </DataPoint>
        </Card>
      </Grid>
      <Grid xs={24} sm={10} md={10}>
        <DillStats dillStats={dillStats} pickleBalance={pickleBalance} />
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
            <PickleIcon size={24} margin="0 0 0 0.5rem" />
            &nbsp;=&nbsp;
            <span>
              $
              {pickleBalance !== null
                ? Number(
                    dillStats.totalPickleValue?.toString() || "0",
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
