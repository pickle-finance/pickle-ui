import CoinGecko from "coingecko-api";

import { getDayDiff } from "../../util/date";

/**
 * [date, price]
 */
type Value = [number, number];
type Payload = {
  data: {
    prices: Value[];
    market_caps: Value[];
    total_volumes: Value[];
  };
};
interface Options {
  from: Date;
}

export const fetchHistoricalPriceSeries = async ({ from }: Options) => {
  const coinGecko = new CoinGecko();

  const toDate = new Date();
  /**
   * Fetching more than 90 days gives us daily data points (instead of hourly)
   * resulting in a much smaller payload.
   */
  const fromDate =
    getDayDiff(from, toDate) > 90 ? from : new Date(toDate.getTime() - 91 * 24 * 60 * 60 * 1000);
  const response: Payload = await coinGecko.coins.fetchMarketChartRange("pickle-finance", {
    vs_currency: "usd",
    from: Math.round(fromDate.getTime() / 1000),
    to: Math.round(toDate.getTime() / 1000),
  });

  return response.data.prices;
};
