import React, { useEffect, useState } from "react";
import { Card, Page, Spacer } from "@geist-ui/react";
import { ethers } from "ethers";
import CoinGecko from "coingecko-api";
import {
  Bar,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { makeStyles } from "@material-ui/core/styles";
import { Connection } from "../../containers/Connection";
import { Contracts, DILL, FEE_DISTRIBUTOR } from "../../containers/Contracts.ts";
import { useProtocolIncome } from "../../containers/DILL/useProtocolIncome";
import { TopBar } from "../../features/TopBar/TopBar";
import { InfoBar } from "../../features/InfoBar/InfoBar";
import { Footer } from "../../features/Footer/Footer";

export default function DillDashboard() {

  const pickleColor = "#64A527";
  const myPickleColor = "#64CB27";
  const dillColor = "#08A20B";
  const myDillColor = "#08DB0B";
  const dollarColor = "#91AB83";
  const labelColor = "#EEE";
  const tooltipBgColor = "#333";
  const projectedPickleColor = "#F7F7A7";
  const projectedDillColor = "#F4F206";

  const useStyles = makeStyles(() => ({
    sectionHeader: {
      width: "100%",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    pickleEarnings: {
      width: "1.5rem",
      height: "0.7rem",
      display: "inline-block",
      backgroundColor: pickleColor,
    },
    projectedPickles: {
      width: "1.5rem",
      height: "0.7rem",
      display: "inline-block",
      backgroundColor: projectedPickleColor,
    },
    dillSupply: {
      width: "1.5rem",
      height: "0.7rem",
      display: "inline-block",
      backgroundColor: dillColor,
    },
    projectedDills: {
      width: "1.5rem",
      height: "0.7rem",
      display: "inline-block",
      backgroundColor: projectedDillColor,
    },
    address: {
      display: "flex",
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      fontSize: "2rem",
    },
    pickle: {
      maxHeight: "100%",
      maxWidth: "100%",
      height: "auto",
      width: "auto",
    },
  }));

  const classes = useStyles();

  const coinId = "pickle-finance";
  const currency = "usd";
  const priceCadence = 120000; // 120000 ms = 2 minutes
  const maxPastDist = 6; // max number of past distributions to retrieve

  const dollarEarningsFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  const dollarsPerDillFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const { blockNum, address } = Connection.useContainer();
  const { dill, feeDistributor } = Contracts.useContainer();
  const { weeklyDistribution } = useProtocolIncome();

  const [picklePrice, setPicklePrice] = useState();
  const [timeCursor, setTimeCursor] = useState();
  const [distributions, setDistributions] = useState([]);

  useEffect(() => {
    async function updatePicklePrice() {
      const coinGecko = new CoinGecko();
      const resp = await coinGecko.simple.price({
        ids: coinId,
        vs_currencies: currency,
      });
      if (resp.success) {
        setPicklePrice(resp.data[coinId][currency]);
      }
    }

    updatePicklePrice();
    const interval = setInterval(() => updatePicklePrice(), priceCadence);
    // return a cleanup function
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function updateTimeCursor() {
      if (blockNum && feeDistributor) {
        const feeDistributorContract = feeDistributor.attach(FEE_DISTRIBUTOR);
        const timeCursorFunc = feeDistributorContract["time_cursor()"];
        const cursor = await timeCursorFunc({ gasLimit: 1000000 });
        setTimeCursor(cursor.toNumber());
      }
    }

    updateTimeCursor();
  }, [blockNum]);

  useEffect(() => {

    async function updateDistributions() {
      if (address && timeCursor && dill && weeklyDistribution && picklePrice) {
        const pastDist = await getPastDistributions();
        const projectedDist = await getProjectedDistribution();
        setDistributions([...pastDist, projectedDist]);
      }
    }

    async function getProjectedDistribution() {
      const dollars = weeklyDistribution.toFixed(2);
      const pickles = dollars / picklePrice;
      const dillContract = dill.attach(DILL);
      const totalSupply = dillContract["totalSupply()"];
      const dillSupply = await totalSupply({ gasLimit: 1000000 });
      const dills = parseFloat(ethers.utils.formatEther(dillSupply));
      const picklesPerDill = (pickles / dills).toFixed(4);
      const dollarsPerDill = (dollars / dills).toFixed(2);
      const projectedDistribution = {
        date: getDateStr(timeCursor),
        timestamp: timeCursor,
        pickles,
        price: picklePrice,
        dills,
        dollars,
        picklesPerDill,
        dollarsPerDill,
        projected: true
      };
      const balanceOf = dillContract["balanceOf(address)"];
      const myDillTokens = await balanceOf(address, { gasLimit: 1000000 });
      const myDills = parseFloat(ethers.utils.formatEther(myDillTokens));
      projectedDistribution.myDills = myDills;
      projectedDistribution.myPickles = myDills * pickles / dills;
      return projectedDistribution;
    }

    async function getPastDistributions() {
      const WEEK = 604800;
      // This the official start - 2021 Apr 23
      const FIRST_DISTRIBUTION = 1619049600;
      const feeDistributorContract = feeDistributor.attach(FEE_DISTRIBUTOR);
      const timestamps = [];
      let currentTime = timeCursor;
      while (timestamps.length < maxPastDist && currentTime
      > FIRST_DISTRIBUTION) {
        currentTime -= WEEK;
        timestamps.unshift(currentTime); // add earlier timestamp to the front
      }
      const distributions = timestamps.map((t) => ({
        date: getDateStr(t),
        timestamp: t
      }));
      const tokensPerWeek = feeDistributorContract["tokens_per_week(uint256)"];
      await Promise.all(timestamps.map(async (t, idx) => {
        const pickleTokens = await tokensPerWeek(t, { gasLimit: 1000000 });
        distributions[idx].pickles = parseFloat(ethers.utils.formatEther(pickleTokens));
      }));
      const veSupply = feeDistributorContract["ve_supply(uint256)"];
      await Promise.all(timestamps.map(async (t, idx) => {
        const dillTokens = await veSupply(t, { gasLimit: 1000000 });
        distributions[idx].dills = parseFloat(ethers.utils.formatEther(dillTokens));
      }));

      const from = timestamps[0];
      const to = timestamps[timestamps.length - 1];
      const prices = await getPricesBetween(from, to);
      if (prices.length) {
        setPricesAtDistributions(prices, distributions);
      }
      distributions.forEach((d) => {
        d.picklesPerDill = (d.pickles / d.dills).toFixed(4);
        if (d.price) {
          d.dollars = (d.price * d.pickles).toFixed(2);
          d.dollarsPerDill = (d.dollars / d.dills).toFixed(2);
        }
      });
      await Promise.all(timestamps.map(async (t, idx) => {
        const veForAt = feeDistributorContract["ve_for_at(address,uint256)"];
        const myDillTokens = await veForAt(address, t, { gasLimit: 1000000 });
        const myDills = parseFloat(ethers.utils.formatEther(myDillTokens));
        const { pickles, dills } = distributions[idx];
        distributions[idx].myDills = myDills;
        distributions[idx].myPickles = myDills * pickles / dills;
      }));
      return distributions;
    }

    async function getPricesBetween(from, to) {
      const coinGecko = new CoinGecko();
      const HOUR = 3600;
      const params = {vs_currency: currency, from: from - HOUR, to: to + HOUR};
      const resp = await coinGecko.coins.fetchMarketChartRange(coinId, params);
      return resp.success ? resp.data.prices : [];
    }

    // distributions happen weekly, while the price changes much more frequently
    // this function sets price on each distribution based on the closest time
    function setPricesAtDistributions(prices, distributions) {
      let i = 0, priceCursor = 0;
      while (i < distributions.length) {
        const distributionTime = distributions[i].timestamp;
        let currentTimeDiff = Number.MAX_SAFE_INTEGER;
        let found = false;
        for (let j = priceCursor; j < prices.length; j++) {
          const priceTime = prices[j][0];
          const timeDiff = Math.abs(priceTime - distributionTime * 1000);
          if (timeDiff < currentTimeDiff) {
            currentTimeDiff = timeDiff;
          } else {
            priceCursor = j;
            found = true;
            distributions[i].price = prices[Math.max(0, j - 1)][1];
            break;
          }
        }
        if (!found) {
          distributions[i].price = prices[prices.length - 1][1];
        }
        i++;
      }
    }

    updateDistributions();
  }, [timeCursor, weeklyDistribution, address]);

  const getDateStr = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

  const DollarLabel = ({x, y, value, formatter}) => {
    const dollarValue = formatter.format(value);
    return (
        <text x={x} y={y} fill={labelColor} fontSize={12} textAnchor="start">
          {dollarValue}
        </text>
    );
  };

  const PickleLabel = ({x, y, value}) => {
    return (
        <text x={x} y={y} fill={labelColor} fontSize={12} textAnchor="start">
          {value}
        </text>
    );
  };

  const EarningsChartHeader = () => {
    return (
        <div className={classes.sectionHeader}>
          <span>Earnings distributed to DILL owners</span>
          <span>
            <div className={classes.pickleEarnings}/> = historical data
          </span>
          <span>
            <div className={classes.projectedPickles}/> = projected data
          </span>
        </div>
    );
  };

  const DillPowerChartHeader = () => {
    return (
        <div className={classes.sectionHeader}>
          <span>Weekly DILL earning power</span>
          <span>
            <div className={classes.dillSupply}/> = historical data
          </span>
          <span>
            <div className={classes.projectedDills}/> = projected data
          </span>
        </div>
    );
  };

  return (
      <>
        <TopBar/>
        <Page>
          <InfoBar/>
          <Spacer />
          {!address && (
              <div className={classes.address}>
                Sorry, you need to connect wallet
                <img src="/assets/jar.png" alt="" className={classes.pickle} />
              </div>
          )}
          {address && (
              <>
                <Card>
                  <EarningsChartHeader/>
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart
                        data={distributions}
                        margin={{top: 40, right: 20, bottom: 20, left: 20}}
                    >
                      <XAxis dataKey="date" tick={{fill: labelColor, fontSize: 11}} />
                      <YAxis yAxisId="pickles" tick={{fill: pickleColor}}/>
                      <YAxis yAxisId="dollars" tick={{fill: dollarColor}}
                             orientation="right"/>
                      <Tooltip contentStyle={{backgroundColor: tooltipBgColor}}/>
                      <Legend/>
                      <Bar yAxisId="pickles" dataKey="pickles" barSize={20}
                           fill={pickleColor}>
                        {
                          distributions.map((d, idx) => (
                              <Cell fill={d.projected ? projectedPickleColor : pickleColor}
                                    key={idx}
                              />
                          ))
                        }
                      </Bar>
                      <Bar yAxisId="pickles" dataKey="myPickles"
                           barSize={15} fill={myPickleColor}>
                        {
                          distributions.map((d, idx) => (
                              <Cell fill={d.projected ? projectedPickleColor : myPickleColor}
                                    key={idx}
                              />
                          ))
                        }
                      </Bar>
                      <Line
                          yAxisId="dollars"
                          type="monotone"
                          dataKey="dollars"
                          fill={dollarColor}
                          stroke={dollarColor}
                          label={<DollarLabel formatter={dollarEarningsFormatter}/>}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Card>
                <Spacer/>
                <Card>
                  <DillPowerChartHeader/>
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart
                        data={distributions}
                        margin={{top: 40, right: 20, bottom: 20, left: 20}}
                    >
                      <XAxis dataKey="date" tick={{fill: labelColor, fontSize: 11}} />
                      <YAxis yAxisId="dills" tick={{fill: dillColor}}/>
                      <YAxis yAxisId="picklesPerDill" hide={true}/>
                      <YAxis yAxisId="dollarsPerDill"
                             tick={{fill: dollarColor}}
                             tickFormatter={(label) => dollarsPerDillFormatter.format(label)}
                             orientation="right"
                      />
                      <Tooltip contentStyle={{backgroundColor: tooltipBgColor}}/>
                      <Legend/>
                      <Bar yAxisId="dills" dataKey="dills" barSize={20} fill={dillColor}>
                        {
                          distributions.map((d, idx) => (
                              <Cell fill={d.projected ? projectedDillColor : myDillColor}
                                    key={idx}
                              />
                          ))
                        }
                      </Bar>
                      <Bar yAxisId="dills" dataKey="myDills"
                           fill={myDillColor} barSize={15}>
                        {
                          distributions.map((d, idx) => (
                              <Cell fill={d.projected ? projectedDillColor : dillColor}
                                    key={idx}
                              />
                          ))
                        }
                      </Bar>
                      <Line
                          yAxisId="picklesPerDill"
                          type="monotone"
                          dataKey="picklesPerDill"
                          fill={pickleColor}
                          stroke={pickleColor}
                          label={<PickleLabel/>}
                      />
                      <Line
                          yAxisId="dollarsPerDill"
                          type="monotone"
                          dataKey="dollarsPerDill"
                          fill={dollarColor}
                          stroke={dollarColor}
                          label={<DollarLabel formatter={dollarsPerDillFormatter}/>}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Card>
              </>
          )}
          <Footer/>
        </Page>
      </>
  );
}
