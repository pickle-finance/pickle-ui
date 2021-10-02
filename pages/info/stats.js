import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import TableContainer from "@material-ui/core/TableContainer";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import TableHead from "@material-ui/core/TableHead";
import Table from "@material-ui/core/Table";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import clsx from "clsx";
import { Page } from "@geist-ui/react";
import { Trans, useTranslation } from "next-i18next";

import { pickleGreen, materialBlack, pickleWhite } from "../../util/constants";
import JarPerformanceChart from "../../components/JarPerformanceChart";
import { getPerformanceData, getPerformanceChart } from "../../util/api";
import { jars } from "../../util/jars";
import dayjs from "util/dayjs";
import { InfoBar } from "../../features/InfoBar/InfoBar";
import { Footer } from "../../features/Footer/Footer";

const useStyles = makeStyles((theme) => ({
  picklePaper: {
    border: `1px solid ${pickleGreen}`,
    borderRadius: "3px",
    backgroundColor: "#0e1d15",
    color: materialBlack,
    minHeight: "100%",
    display: "block",
    flexDirection: "column",
  },
  table: {
    maxWidth: "100%",
    margin: "auto",
    flexGrow: 1,
  },
  cell: {
    color: materialBlack,
    borderBottom: "1px solid gray",
  },
  header: {
    color: materialBlack,
    fontSize: ".7rem",
  },
  title: {
    marginBottom: "10px",
    fontSize: "2rem",
    letterSpacing: "6px",
  },
  section: {
    color: materialBlack,
  },
  update: {
    justifyContent: "center",
    margin: "auto",
    paddingBottom: "10px",
    paddingTop: "10px",
  },
}));

export default function Statistics() {
  const classes = useStyles();
  const { t } = useTranslation("common");

  const [performanceData, setPerformanceData] = useState({
    data: [],
    performance: [],
  });
  useEffect(() => {
    const retrievePerformanceData = async () => {
      const data = await Promise.all([
        getPerformanceChart(jars),
        getPerformanceData(jars),
      ]);
      setPerformanceData({
        data: data[0],
        performance: data[1],
      });
    };
    retrievePerformanceData();
  }, []);

  const Entry = (props) => (
    <TableCell className={classes.cell}>{props.entry}</TableCell>
  );
  const Value = (props) => (
    <TableCell className={classes.cell} align="right">
      {props.value}
    </TableCell>
  );
  return (
    <>
      <Page>
        <InfoBar />
        <Grid container spacing={2}>
          <Grid item xs={12} className={classes.section}>
            <Typography variant="h4" className={classes.title}>
              {t("info.picklePulse")}
            </Typography>
          </Grid>
          <Grid item xs={12} md={7}>
            <JarPerformanceChart data={performanceData.data} />
          </Grid>
          <Grid item xs={12} md={5}>
            <TableContainer component={Paper} className={classes.picklePaper}>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.header}>
                      {t("info.asset")}
                    </TableCell>
                    <TableCell className={classes.header} align="right">
                      <Trans i18nKey="time.day" count={3}>
                        3 day
                      </Trans>
                    </TableCell>
                    <TableCell className={classes.header} align="right">
                      <Trans i18nKey="time.week" count={1}>
                        1 week
                      </Trans>
                    </TableCell>
                    <TableCell className={classes.header} align="right">
                      <Trans i18nKey="time.month" count={1}>
                        1 month
                      </Trans>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jars.map((asset, i) => {
                    const item =
                      performanceData.performance.length > 0
                        ? performanceData.performance[i]
                        : { asset: asset };
                    return !item ? (
                      <></>
                    ) : (
                      <TableRow key={i}>
                        <Entry entry={item.asset} />
                        <Value
                          value={
                            item.threeDay !== undefined
                              ? `${item.threeDay.toFixed(2)}%`
                              : "-"
                          }
                        />
                        <Value
                          value={
                            item.sevenDay !== undefined
                              ? `${item.sevenDay.toFixed(2)}%`
                              : "-"
                          }
                        />
                        <Value
                          value={
                            item.thirtyDay !== undefined
                              ? `${item.thirtyDay.toFixed(2)}%`
                              : "-"
                          }
                        />
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div
                style={{ color: pickleWhite, padding: "5px" }}
                className={clsx(classes.header, classes.update)}
              >
                {t("info.lastUpdated")}:{" "}
                {performanceData.performance.length > 0
                  ? dayjs(
                      performanceData.performance[
                        performanceData.performance.length - 1
                      ].x,
                    ).calendar()
                  : t("connection.loading")}
              </div>
            </TableContainer>
          </Grid>
        </Grid>
        <Footer />
      </Page>
    </>
  );
}

export { getStaticProps } from "../../util/locales";
