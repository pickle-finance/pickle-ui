import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { crvJars, sushiJars, uniJars } from "../../util/jars";
import { getJarChart, getStakingChart, getProtocolData } from "../../util/api";
import { materialBlack } from "../../util/constants";
import JarValueChart from "../../components/JarValueChart";
import Grid from "@material-ui/core/Grid";
import clsx from "clsx";
import { Page } from "@geist-ui/react";
import { TopBar } from "../../features/TopBar/TopBar";
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
  });

  useEffect(() => {
    const retrieveDashboardData = async () => {
      const requests = [
        getJarChart(crvJars),
        getProtocolData(),
        getJarChart(sushiJars),
        getJarChart(uniJars),
      ];
      const dashboardData = await Promise.all(requests);

      // assign data objects from promise
      const crvData = dashboardData[0];
      const protocolData = dashboardData[1];
      const sushiData = dashboardData[2];
      const uniData = dashboardData[3];
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
      });
    };
    retrieveDashboardData();
  }, []);

  const jars = dashboardData.sushiJars.concat(dashboardData.uniJars);
  return (
    <>
      <TopBar />
      <Page>
        <InfoBar />
        <Grid container spacing={2}>
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
