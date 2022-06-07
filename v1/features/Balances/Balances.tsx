import { FC, useState, useEffect } from "react";
import styled from "styled-components";
import { Card, Grid, Tooltip } from "@geist-ui/react";
import { useTranslation } from "next-i18next";

import { useBalances } from "./useBalances";
import { Prices } from "../../containers/Prices";
import { Connection } from "../../containers/Connection";
import { Prices as PriceComponent } from "../Prices/Prices";
import { ethers } from "ethers";
import { getProtocolData } from "v1/util/api";
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

  const { blockNum } = Connection.useContainer();
  const { prices } = Prices.useContainer();

  const [protocolInfo, setProtocolInfo] = useState<any>(undefined);
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
      if (picklePerBlock) setTooltipText(t("balances.picklePerBlock", { amount: picklePerBlock }));
      if (picklePerSecond)
        setTooltipText(t("balances.picklePerSecond", { amount: picklePerSecond }));
    };
    updateInfo();
  }, [blockNum]);

  return (
    <>
      <Container gap={2}>
        <Grid xs={24} sm={24} md={12}>
          <Card>
            <h2>{t("balances.yourBalance")}</h2>
            <DataPoint>
              <span>{pickleBalance !== null ? formatPickles(pickleBalance) : "--"}</span>
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
              {t("balances.pending")}:&nbsp;
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
            <h2>{t("balances.marketCap")}</h2>
            <DataPoint>
              <span>
                {prices?.pickle && totalSupply && marketCap ? formatDollars(marketCap) : "--"}
              </span>
            </DataPoint>
            <Card.Footer>
              {totalSupply && tooltipText && marketCap ? (
                <Tooltip placement="bottom" style={{ cursor: `help` }} text={tooltipText}>
                  {t("balances.totalSupply")}:{" "}
                  {totalSupply && prices?.pickle ? formatPickles(marketCap / prices?.pickle) : "--"}
                  <PickleIcon size={14} />
                </Tooltip>
              ) : (
                <span>
                  {t("balances.totalSupply")}: --
                  <PickleIcon size={14} margin="0 0 0 0.5rem" />
                </span>
              )}
            </Card.Footer>
          </Card>
        </Grid>
        <Grid xs={24} sm={12} md={12}>
          <Card>
            <h2>{t("balances.totalValueLocked")}</h2>
            <DataPoint>
              <span>{protocolInfo ? formatDollars(protocolInfo.totalValue) : "--"}</span>
            </DataPoint>
            <Card.Footer>
              <Tooltip
                placement="bottom"
                text={t("balances.poolSizeTooltip")}
                style={{ cursor: `help` }}
              >
                {t("balances.poolSize")}:{" "}
                {protocolInfo
                  ? formatDollars(protocolInfo.totalValue - protocolInfo.jarValue)
                  : "--"}
              </Tooltip>
            </Card.Footer>
          </Card>
        </Grid>
      </Container>
    </>
  );
};
