import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { pickleGreen, cardColor, materialBlack } from "../util/constants";
import JarPerformanceChart from "../components/JarPerformanceChart";
import { getPerformanceData, getPerformanceChart } from "../util/api";
import TableContainer from "@material-ui/core/TableContainer";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import TableHead from "@material-ui/core/TableHead";
import Table from "@material-ui/core/Table";
import Paper from "@material-ui/core/Paper";
import { jars } from "../util/jars";
import Grid from "@material-ui/core/Grid";
import moment from "moment";
import clsx from "clsx";
import { Page } from "@geist-ui/react";
import { TopBar } from "../../features/TopBar/TopBar";
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
    maxWidth: "90%",
    margin: "auto",
    flexGrow: 1,
  },
  cell: {
    color: materialBlack,
    borderBottom: "1px solid gray",
  },
  header: {
    color: materialBlack,
    letterSpacing: "3px",
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
      <TopBar />
      <Page>
        <Grid container spacing={2}>
          <Grid item xs={12} className={classes.section}>
            <Typography variant="h4" className={classes.title}>
              Pickle Pulse
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
                    <TableCell className={classes.header}>Asset</TableCell>
                    <TableCell className={classes.header} align="right">
                      3 day
                    </TableCell>
                    <TableCell className={classes.header} align="right">
                      1 week
                    </TableCell>
                    <TableCell className={classes.header} align="right">
                      1 month
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
              <div className={clsx(classes.header, classes.update)}>
                Last Updated:{" "}
                {performanceData.performance.length > 0
                  ? moment(
                      performanceData.performance[
                        performanceData.performance.length - 1
                      ].x,
                    ).calendar()
                  : "Loading..."}
              </div>
            </TableContainer>
          </Grid>
        </Grid>
      </Page>
      <Footer />
    </>
  );
}
