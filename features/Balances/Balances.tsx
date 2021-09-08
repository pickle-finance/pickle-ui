import { FC, useState, useEffect } from "react";
import styled from "styled-components";
import { Card, Grid, Tooltip } from "@geist-ui/react";
import { useTranslation } from "next-i18next";

import { useBalances } from "./useBalances";
import { Prices } from "../../containers/Prices";
import { UniV2Pairs } from "../../containers/UniV2Pairs";
import { Connection } from "../../containers/Connection";
import { Jars } from "../../containers/Jars";
import { PickleStaking } from "../../containers/PickleStaking";
import { Prices as PriceComponent } from "../Prices/Prices";
import { ethers } from "ethers";
import { getProtocolData } from "util/api";
import PickleIcon from "../../components/PickleIcon";

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

const formatPickles = (num: number) =>
  num?.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
const formatDollars = (num: number) =>
  "$" +
  num?.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const Balances: FC = () => {
  const {
    pickleBalance,
    pendingPickles,
    totalSupply,
    picklePerBlock,
    picklePerSecond,
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
  const [protocolInfo, setProtocolInfo] = useState(undefined);
  const [marketCap, setMarketCap] = useState<number | null>(null);
  const [tooltipText, setTooltipText] = useState<string | null>("");
  const { t } = useTranslation("common");

  useEffect(() => {
    const updateInfo = async () => {
      setProtocolInfo(await getProtocolData());
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=pickle-finance&vs_currencies=usd&include_market_cap=true",
      ).then((x) => x.json());
      setMarketCap(res["pickle-finance"].usd_market_cap);
      if (picklePerBlock)
        setTooltipText(`${picklePerBlock} PICKLEs are printed every block.`);
      if (picklePerSecond)
        setTooltipText(`${picklePerSecond} PICKLEs are printed every second.`);
    };
    updateInfo();
  }, [blockNum]);
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
              <PickleIcon size={24} margin="0 0 0 0.5rem" />
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
                <PickleIcon size={14} margin="0 0 0 0.5rem" />
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
                {prices?.pickle && totalSupply && marketCap
                  ? formatDollars(marketCap)
                  : "--"}
              </span>
            </DataPoint>
            <Card.Footer>
              {totalSupply && tooltipText && marketCap ? (
                <Tooltip
                  placement="bottom"
                  style={{ cursor: `help` }}
                  text={tooltipText}
                >
                  Total Supply:{" "}
                  {totalSupply
                    ? formatPickles(marketCap / prices?.pickle)
                    : "--"}
                  <PickleIcon size={14} />
                </Tooltip>
              ) : (
                <span>
                  Total Supply: --
                  <PickleIcon size={14} margin="0 0 0 0.5rem" />
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
                {protocolInfo ? formatDollars(protocolInfo.totalValue) : "--"}
              </span>
            </DataPoint>
            <Card.Footer>
              <Tooltip
                placement="bottom"
                text="Total ETH/PICKLE pool value on Uniswap."
                style={{ cursor: `help` }}
              >
                {t("poolSize")}:{" "}
                {protocolInfo
                  ? formatDollars(
                      protocolInfo.totalValue - protocolInfo.jarValue,
                    )
                  : "--"}
              </Tooltip>
            </Card.Footer>
          </Card>
        </Grid>
      </Container>
    </>
  );
};
