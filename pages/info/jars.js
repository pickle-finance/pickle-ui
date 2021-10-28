import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { Page } from "@geist-ui/react";
import clsx from "clsx";
import { useTranslation } from "next-i18next";

import { crvJars, sushiJars, uniJars, polyJars, arbJars } from "../../util/jars";
import { getJarChart, getProtocolData } from "../../util/api";
import { materialBlack } from "../../util/constants";
import JarValueChart from "../../components/JarValueChart";
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
    arbJars: chartSkeletons(arbJars),
  });

  useEffect(() => {
    const retrieveDashboardData = async () => {
      const requests = [
        getJarChart(crvJars),
        getProtocolData(),
        getJarChart(sushiJars),
        getJarChart(uniJars),
        getJarChart(polyJars),
        getJarChart(arbJars),
      ];
      const dashboardData = await Promise.all(requests);

      // assign data objects from promise
      const crvData = dashboardData[0];
      const protocolData = dashboardData[1];
      const sushiData = dashboardData[2];
      const uniData = dashboardData[3];
      const polyData = dashboardData[4];
      const arbData = dashboardData[5];
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
        arbJars: arbData,
      });
    };
    retrieveDashboardData();
  }, []);

  const jars = dashboardData.sushiJars.concat(dashboardData.uniJars);
  const allJars = dashboardData.sushiJars
    .concat(dashboardData.crvJars)
    .concat(dashboardData.uniJars)
    .concat(dashboardData.polyJars)
    .concat(dashboardData.arbJars);
  const assets = allJars.filter((d) => d !== null && d !== undefined ).map((d) => {
    return d.asset;
  });
  const blockData = {};
  const mostRecent = {};
  allJars.forEach((item) => {
    if( !item || !item.data)
      return;
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
      y += (mostRecent[asset] !== undefined ? mostRecent[asset] : 0);
    }
    point = { ...point, y: y };
    combinedData.push(point);
  }
  const trimmedData = combinedData;

  const tvlJar = {
    data: trimmedData.filter((x) => Object.values(x)[1]),
    asset: "Pickle Finance",
  };
  const { t } = useTranslation("common");

  return (
    <>
      <Page>
        <InfoBar />
        <Grid container spacing={2}>
          <h1>{t("balances.totalValueLocked")}</h1>

          <Grid item xs={12}>
            <JarValueChart jar={tvlJar} />
          </Grid>

          <Grid
            item
            xs={12}
            className={clsx(classes.section, classes.separator)}
          >
            <h1>{t("info.polyJars")}</h1>
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
            <h1>{t("info.arbJars")}</h1>
          </Grid>
          {dashboardData.arbJars.map((jar) => {
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

export { getStaticProps } from "../../util/locales";
