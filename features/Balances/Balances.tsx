import { FC, useState, useEffect } from "react";
import styled from "styled-components";
import { Card, Grid, Tooltip } from "@geist-ui/react";
import { useBalances } from "./useBalances";
import { Prices } from "../../containers/Prices";
import { UniV2Pairs } from "../../containers/UniV2Pairs";
import { Connection } from "../../containers/Connection";
import { Jars } from "../../containers/Jars-Ethereum";
import { PickleStaking } from "../../containers/PickleStaking";
import { Prices as PriceComponent } from "../Prices/Prices";
import { ethers } from "ethers";

const Container = styled(Grid.Container)`
  font-family: "Source Code Pro", sans-serif;
`;

const DataPoint = styled.div`
  font-size: 24px;
  display: flex;
  align-items: center;
`;

const HideOnMobile = styled.div`
  @media screen and (max-width: 600px) {
    display: none;
  }
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

const formatPickles = (num: number) =>
  num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
const formatDollars = (num: number) =>
  "$" +
  num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const Balances: FC = () => {
  const {
    pickleBalance,
    pendingPickles,
    totalSupply,
    picklePerBlock,
  } = useBalances();

  const { WETHRewards } = PickleStaking.useContainer();

  let earned = ethers.constants.Zero;
  let staked = ethers.constants.Zero;

  if (WETHRewards) {
    const { staked: stakedWETH, earned: earnedWETH } = WETHRewards;

    if (stakedWETH && earnedWETH) {
      earned = earned.add(earnedWETH);
      staked = staked.add(stakedWETH);
    }
  }

  const { blockNum } = Connection.useContainer();
  const { prices } = Prices.useContainer();
  const { getPairData } = UniV2Pairs.useContainer();
  const { jars } = Jars.useContainer();

  const [liquidity, setLiquidity] = useState<number | null>(null);

  useEffect(() => {
    const getLiquidity = async () => {
      if (getPairData) {
        const { totalValueOfPair } = await getPairData(
          "0xdc98556Ce24f007A5eF6dC1CE96322d65832A819",
        );
        setLiquidity(totalValueOfPair);
      }
    };
    getLiquidity();
  }, [getPairData, blockNum]);

  let totalValueLocked = null;
  if (jars) {
    totalValueLocked = jars.reduce((acc, x) => {
      return acc + (x?.tvlUSD || 0);
    }, liquidity || 0);
  }

  return (
    <>
      <Container gap={2}>
        <Grid xs={24} sm={24} md={12}>
          <Card>
            <h2>Your Balance</h2>
            <DataPoint>
              <span>
                {pickleBalance !== null ? formatPickles(pickleBalance) : "--"}
              </span>
              <PickleIcon />
              {pickleBalance !== null && prices?.pickle && (
                <HideOnMobile>
                  <span style={{ fontSize: `1rem` }}>
                    &nbsp;=&nbsp;
                    {formatDollars(pickleBalance * prices?.pickle)}
                  </span>
                </HideOnMobile>
              )}
            </DataPoint>
            <Card.Footer>
              Pending:&nbsp;
              <span>
                {pendingPickles !== null ? formatPickles(pendingPickles) : "--"}
                <PickleIcon size="14px" />
              </span>
              {pendingPickles !== null && prices?.pickle && (
                <HideOnMobile>
                  =&nbsp;
                  <span>{formatDollars(pendingPickles * prices?.pickle)}</span>
                </HideOnMobile>
              )}
            </Card.Footer>
          </Card>
        </Grid>
        <Grid xs={24} sm={12} md={12}>
          <PriceComponent />
        </Grid>
        <Grid xs={24} sm={12} md={12}>
          <Card>
            <h2>Market Cap</h2>
            <DataPoint>
              <span>
                {prices?.pickle && totalSupply
                  ? formatDollars(prices.pickle * totalSupply)
                  : "--"}
              </span>
            </DataPoint>
            <Card.Footer>
              {totalSupply && picklePerBlock ? (
                <Tooltip
                  placement="bottom"
                  style={{ cursor: `help` }}
                  text={
                    picklePerBlock
                      ? `${picklePerBlock} PICKLEs are printed every block.`
                      : ""
                  }
                >
                  Total Supply:{" "}
                  {totalSupply ? formatPickles(totalSupply) : "--"}
                  <PickleIcon size="14px" />
                </Tooltip>
              ) : (
                <span>
                  Total Supply: --
                  <PickleIcon size="14px" />
                </span>
              )}
            </Card.Footer>
          </Card>
        </Grid>
        <Grid xs={24} sm={12} md={12}>
          <Card>
            <h2>Total Value Locked</h2>
            <DataPoint>
              <span>
                {totalValueLocked ? formatDollars(totalValueLocked) : "--"}
              </span>
            </DataPoint>
            <Card.Footer>
              <Tooltip
                placement="bottom"
                text="Total ETH/PICKLE pool value on Uniswap."
                style={{ cursor: `help` }}
              >
                Pool size: {liquidity ? formatDollars(liquidity) : "--"}
              </Tooltip>
            </Card.Footer>
          </Card>
        </Grid>
      </Container>
    </>
  );
};
