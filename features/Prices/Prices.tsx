import { FC } from "react";
import styled from "styled-components";
import { Card, Grid } from "@geist-ui/react";
import { Prices as PricesContainer } from "../../containers/Prices";

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

const TradeButton = styled.a`
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
  return (
    <Grid.Container gap={2}>
      <Grid xs={24} sm={24} md={24}>
        <Card>
          <Card.Content style={{ height: `304px` }}>
            <h2>Prices</h2>
            <TradeButton
              href="https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0x429881672b9ae42b8eba0e26cd9c73711b891ca5"
              target="_blank"
              rel="noopener noreferrer"
            >
              Trade $Pickle
            </TradeButton>
            <DataPoint>
              <Label>
                <CoinIcon src="/pickle.png" />
                PICKLE:
              </Label>
              <Monospace>
                {prices?.pickle ? formatDollars(prices.pickle) : "--"}
              </Monospace>
            </DataPoint>
            <DataPoint>
              <Label>
                <CoinIcon src="/ethereum.png" />
                ETH:
              </Label>
              <Monospace>
                {prices?.eth ? formatDollars(prices.eth) : "--"}
              </Monospace>
            </DataPoint>
            <DataPoint>
              <Label>
                <CoinIcon src="/dai.png" />
                DAI:
              </Label>
              <Monospace>
                {prices?.dai ? formatDollars(prices.dai) : "--"}
              </Monospace>
            </DataPoint>
            <DataPoint>
              <Label>
                <CoinIcon src="/usdc.png" />
                USDC:
              </Label>
              <Monospace>
                {prices?.usdc ? formatDollars(prices.usdc) : "--"}
              </Monospace>
            </DataPoint>
            <DataPoint>
              <Label>
                <CoinIcon src="/usdt.png" />
                USDT:
              </Label>
              <Monospace>
                {prices?.usdt ? formatDollars(prices.usdt) : "--"}
              </Monospace>
            </DataPoint>
          </Card.Content>
          <Card.Footer>
            <Monospace>
              Source:&nbsp;
              <a
                href="https://www.coingecko.com/en/coins/pickle-finance"
                target="_blank"
                rel="noopener noreferrer"
              >
                CoinGecko
              </a>
            </Monospace>
          </Card.Footer>
        </Card>
      </Grid>
    </Grid.Container>
  );
};
