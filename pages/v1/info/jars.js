import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { Page } from "@geist-ui/react";
import clsx from "clsx";
import { useTranslation } from "next-i18next";

import { crvJars, sushiJars, uniJars, polyJars, arbJars } from "v1/util/jars";
import { getAllJarsChart, getProtocolData } from "v1/util/api";
import { materialBlack } from "v1/util/constants";
import JarValueChart from "v1/components/JarValueChart";
import { InfoBar } from "v1/features/InfoBar/InfoBar";
import { Footer } from "v1/features/Footer/Footer";

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
    allJars: chartSkeletons([...crvJars, ...uniJars, ...sushiJars, ...polyJars, ...arbJars]),
  });

  useEffect(() => {
    const retrieveDashboardData = async () => {
      const requests = [getProtocolData(), getAllJarsChart()];
      const dashboardData = await Promise.all(requests);

      // assign data objects from promise
      const protocolData = dashboardData[0];
      const allJarsData = dashboardData[1];
      const metrics = {
        date: protocolData.updatedAt,
        jarValue: protocolData.jarValue,
        totalValue: protocolData.totalValue,
      };

      const filterJars = (jarsList, allJars) => {
        const jarsListLower = jarsList.map((jar) => jar.toLowerCase());
        const filtered = allJars.filter((jar) => jarsListLower.includes(jar.asset.toLowerCase()));
        return filtered;
      };

      const crvData = filterJars(crvJars, allJarsData);
      const sushiData = filterJars(sushiJars, allJarsData);
      const uniData = filterJars(uniJars, allJarsData);
      const polyData = filterJars(polyJars, allJarsData);
      const arbData = filterJars(arbJars, allJarsData);

      // construct staking data
      setDashboardData({
        crvJars: crvData,
        metrics: metrics,
        sushiJars: sushiData,
        uniJars: uniData,
        polyJars: polyData,
        arbJars: arbData,
        allJars: allJarsData,
      });
    };
    retrieveDashboardData();
  }, []);

  const assets = dashboardData.allJars
    .filter((d) => d !== null && d !== undefined)
    .map((d) => {
      return d.asset;
    });
  const blockData = {};
  const mostRecent = {};
  dashboardData.allJars.forEach((item) => {
    if (!item || !item.data) return;
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
      y += mostRecent[asset] !== undefined ? mostRecent[asset] : 0;
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

          <Grid item xs={12} className={clsx(classes.section, classes.separator)}>
            <h1>{t("info.polyJars")}</h1>
          </Grid>
          {dashboardData.polyJars.map((jar) => {
            return (
              <Grid item xs={12} sm={6} key={jar.asset}>
                <JarValueChart jar={jar} />
              </Grid>
            );
          })}

          <Grid item xs={12} className={clsx(classes.section, classes.separator)}>
            <h1>{t("info.arbJars")}</h1>
          </Grid>
          {dashboardData.arbJars.map((jar) => {
            return (
              <Grid item xs={12} sm={6} key={jar.asset}>
                <JarValueChart jar={jar} />
              </Grid>
            );
          })}

          <Grid item xs={12} className={clsx(classes.section, classes.separator)}>
            <h1>pJar 0</h1>
          </Grid>
          {dashboardData.crvJars.map((jar) => {
            return (
              <Grid item xs={12} sm={6} key={jar.asset}>
                <JarValueChart jar={jar} />
              </Grid>
            );
          })}
          <Grid item xs={12} className={clsx(classes.section, classes.separator)}>
            <h1>pJar 0.99</h1>
          </Grid>
          {dashboardData.sushiJars.concat(dashboardData.uniJars).map((jar, i) => {
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

export { getStaticProps } from "v1/util/locales";
