import { FC } from "react";
import styled from "styled-components";
import { Card, Grid } from "@geist-ui/react";
import { Prices as PricesContainer } from "../../containers/Prices";
import { Connection } from "v1/containers/Connection";
import { ChainNetwork } from "picklefinance-core";

const DataPoint = styled.div`
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.4rem;
`;

const Label = styled.div`
  font-family: "Source Sans Pro", sans-serif;
`;

const Monospace = styled.div`
  font-family: "Source Code Pro", sans-serif;
`;

export const TradeButton = styled.a`
  box-sizing: border-box;
  display: inline-block;
  padding: 0 1.25rem;
  height: 2rem;
  line-height: 2rem;
  min-width: 9.375rem;
  width: initial;
  border-radius: 5px;
  font-weight: 400;
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: 1rem;
  width: 100%;
  color: #53ffe2;
  background-color: #0e1d15;
  border: 1px solid #53ffe2;
  text-decoration: none;
  text-transform: uppercase;
  font-weight: bold;

  &:hover {
    box-shadow: rgb(83, 255, 226) 0px 0px 8px;
  }
`;

const formatDollars = (num: number) =>
  "$" +
  num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const CoinIcon = ({ src }: { src: string }) => (
  <img src={src} style={{ width: `24px`, marginRight: `0.75rem` }} />
);

export const Prices: FC = () => {
  const { prices } = PricesContainer.useContainer();
  const { chainName } = Connection.useContainer();

  const swapLink = () => {
    switch (chainName) {
      case ChainNetwork.Polygon:
        return "https://swap.cometh.io/#/swap?inputCurrency=0x9c78ee466d6cb57a4d01fd887d2b5dfb2d46288f&outputCurrency=0x2b88ad57897a8b496595925f43048301c37615da";
      case ChainNetwork.Arbitrum:
        return "https://arbitrum.balancer.fi/#/trade/ether/0x965772e0E9c84b6f359c8597C891108DcF1c5B1A";
      case ChainNetwork.Ethereum:
      default:
        return "https://analytics.sushi.com/pairs/0x269db91fc3c7fcc275c2e6f22e5552504512811c";
    }
  };
  return (
    <Card style={{ height: "169px" }}>
      <Card.Content>
        <TradeButton href={swapLink()} target="_blank" rel="noopener noreferrer">
          Buy $Pickle
        </TradeButton>
        <DataPoint>
          <Label>
            <CoinIcon src="/pickle.png" />
            PICKLE:
          </Label>
          <Monospace>{prices?.pickle ? formatDollars(prices.pickle) : "--"}</Monospace>
        </DataPoint>
        <DataPoint>
          <Label>
            <CoinIcon src="/ethereum.png" />
            ETH:
          </Label>
          <Monospace>{prices?.eth ? formatDollars(prices.eth) : "--"}</Monospace>
        </DataPoint>
      </Card.Content>
    </Card>
  );
};
