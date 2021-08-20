import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { crvJars, sushiJars, uniJars, polyJars } from "../../util/jars";
import { getJarChart, getProtocolData } from "../../util/api";
import { materialBlack } from "../../util/constants";
import JarValueChart from "../../components/JarValueChart";
import Grid from "@material-ui/core/Grid";
import clsx from "clsx";
import { Page } from "@geist-ui/react";
import { InfoBar } from "../../features/InfoBar/InfoBar";
import { Footer } from "../../features/Footer/Footer";

export const useStyles = makeStyles(() => ({
  title: {
    marginBottom: "10px",
    fontSize: "2rem",
    letterSpacing: "6px",
  },
  section: {
    color: materialBlack,
  },
  separator: {
    marginTop: "25px",
  },
}));

const chartSkeletons = (charts) =>
  Array.from({ length: charts.length }, (c, i) => ({
    asset: `${i}`,
    data: [],
  }));

export default function Dashboard() {
  const classes = useStyles();

  const [dashboardData, setDashboardData] = useState({
    crvJars: chartSkeletons(crvJars),
    sushiJars: chartSkeletons(sushiJars),
    uniJars: chartSkeletons(uniJars),
    polyJars: chartSkeletons(polyJars),
  });

  useEffect(() => {
    const retrieveDashboardData = async () => {
      const requests = [
        getJarChart(crvJars),
        getProtocolData(),
        getJarChart(sushiJars),
        getJarChart(uniJars),
        getJarChart(polyJars),
      ];
      const dashboardData = await Promise.all(requests);

      // assign data objects from promise
      const crvData = dashboardData[0];
      const protocolData = dashboardData[1];
      const sushiData = dashboardData[2];
      const uniData = dashboardData[3];
      const polyData = dashboardData[4];
      const metrics = {
        date: protocolData.updatedAt,
        jarValue: protocolData.jarValue,
        totalValue: protocolData.totalValue,
      };

      // construct staking data
      setDashboardData({
        crvJars: crvData,
        metrics: metrics,
        sushiJars: sushiData,
        uniJars: uniData,
        polyJars: polyData,
      });
    };
    retrieveDashboardData();
  }, []);

  const jars = dashboardData.sushiJars.concat(dashboardData.uniJars);
  const allJars = dashboardData.sushiJars
    .concat(dashboardData.crvJars)
    .concat(dashboardData.uniJars)
    .concat(dashboardData.polyJars);

  const assets = allJars.map((d) => d.asset);
  const blockData = {};
  const mostRecent = {};
  allJars.forEach((item) => {
    item.data.forEach((d) => {
      if (blockData[d.x] === undefined) {
        blockData[d.x] = { x: d.x };
      }
      blockData[d.x][item.asset] = d.y;
      mostRecent[item.asset] = 0;
    });
  });

  const combinedData = [];
  for (const timestampid of Object.keys(blockData).sort()) {
    let point = { x: parseInt(timestampid) };
    const value = blockData[timestampid];
    let y = 0;
    for (const asset of assets) {
      if (value[asset]) {
        mostRecent[asset] = value[asset];
      }
      y += mostRecent[asset];
      point = { ...point, y: y };
    }
    combinedData.push(point);
  }

  const trimmedData = [];
  for (let i = 0; i < combinedData.length; i++) {
    if (i % 50 === 0) {
      trimmedData.push(combinedData[i]);
    }
  }

  const tvlJar = {
    data: trimmedData.filter((x) => Object.values(x)[1]),
    asset: "Pickle Finance",
  };

  return (
    <>
      <Page>
        <InfoBar />
        <Grid container spacing={2}>
          <h1>Total Value Locked</h1>

          <Grid item xs={12}>
            <JarValueChart jar={tvlJar} />
          </Grid>

          <Grid
            item
            xs={12}
            className={clsx(classes.section, classes.separator)}
          >
            <h1>polyJars</h1>
          </Grid>
          {dashboardData.polyJars.map((jar) => {
            return (
              <Grid item xs={12} sm={6} key={jar.asset}>
                <JarValueChart jar={jar} />
              </Grid>
            );
          })}
          <Grid
            item
            xs={12}
            className={clsx(classes.section, classes.separator)}
          >
            <h1>pJar 0</h1>
          </Grid>
          {dashboardData.crvJars.map((jar) => {
            return (
              <Grid item xs={12} sm={6} key={jar.asset}>
                <JarValueChart jar={jar} />
              </Grid>
            );
          })}
          <Grid
            item
            xs={12}
            className={clsx(classes.section, classes.separator)}
          >
            <h1>pJar 0.99</h1>
          </Grid>
          {jars.concat().map((jar, i) => {
            return (
              <Grid item xs={12} sm={6} key={i}>
                <JarValueChart jar={jar} />
              </Grid>
            );
          })}
        </Grid>
        <Footer />
      </Page>
    </>
  );
}
