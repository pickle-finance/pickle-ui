import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import styled from "styled-components";
import { Card } from "@geist-ui/react";
import Tooltip from "@material-ui/core/Tooltip";
import Grid from "@material-ui/core/Grid";
import Avatar from "@material-ui/core/Avatar";
import Skeleton from "@material-ui/lab/Skeleton";
import TableBody from "@material-ui/core/TableBody";
import TableHead from "@material-ui/core/TableHead";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableRow from "@material-ui/core/TableRow";
import Table from "@material-ui/core/Table";
import Paper from "@material-ui/core/Paper";
import { Page } from "@geist-ui/react";
import { useTranslation } from "next-i18next";

import { InfoBar } from "../features/InfoBar/InfoBar";
import { Footer } from "../features/Footer/Footer";
import { cardColor, pickleGreen, materialBlack } from "../util/constants";
import {
  getProtocolData,
  getStakingData,
  getFarmData,
  getPerformanceData,
  getCoinData,
} from "../util/api";
import { powerPool, jars } from "../util/jars";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  root: {
    color: pickleGreen,
  },
  claimContent: {
    justifyContent: "center",
  },
  claimLink: {
    cursor: "pointer",
    color: "#0492c2",
    textShadow: "0px 0px 3px #0492c2",
  },
  warning: {
    fontSize: "1rem",
    display: "flex",
    color: "red",
    justifyContent: "center",
    alignContent: "center",
  },
  warningContent: {
    display: "flex",
    flexDirection: "column",
  },
  warningLink: {
    textDecoration: "none",
    marginLeft: "5px",
    color: pickleGreen,
  },
  card: {
    color: materialBlack,
    backgroundColor: cardColor,
    border: `1px solid ${pickleGreen}`,
    borderRadius: "3px",
  },
  cardContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tableAsset: {
    display: "flex",
    alignItems: "center",
  },
  cardIcon: {
    marginRight: theme.spacing(3),
    marginLeft: theme.spacing(3),
  },
  cardInfo: {
    display: "flex",
    flexDirection: "column",
  },
  cardTitle: {
    fontSize: "1rem",
  },
  cardValue: {
    fontSize: "1.6rem",
    letterSpacing: "2px",
  },
  cardSubText: {
    fontSize: ".8rem",
  },
  tagline: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    fontSize: "2rem",
    letterSpacing: "6px",
  },
  subtitle: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    fontSize: "1.3rem",
    letterSpacing: "4px",
    color: materialBlack,
  },
  farmTable: {
    backgroundColor: "#0e1d15",
    borderTopLeftRadius: "3px",
    borderTopRightRadius: "3px",
    border: `1px solid ${pickleGreen}`,
  },
  farmTableCell: {
    color: materialBlack,
    borderBottom: "1px solid gray",
  },
  farmIcon: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(3),
    height: "25px",
    width: "25px",
  },
  emissionIcon: {
    marginRight: theme.spacing(1),
    height: "15px",
    width: "15px",
  },
  disclaimer: {
    textAlign: "center",
    fontSize: ".6rem",
    color: pickleGreen,
    borderBottom: "none",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  skeletonRow: {
    backgroundColor: "darkgreen",
    opacity: "30%",
  },
  pickleHeader: {
    maxWidth: "80%",
    margin: "auto",
  },
}));

const jarOptions = jars.concat([powerPool]);

const DataPoint = styled.div`
  font-size: 24px;
  display: flex;
  align-items: center;
`;

const FarmRow = (props) => {
  const classes = useStyles();
  const { t } = useTranslation("common");

  const { farm, item, jar, isFarm = true } = props;
  const farmName = jarOptions.find(
    (jar) => jar.toLowerCase() === farm.toLowerCase(),
  );
  const icon = `./assets/${farm.toLowerCase()}.png`;
  const picklePerDay = (1000 / item.valueBalance) * item.picklePerDay;

  if (!item.tokenBalance && !item.valueBalance) {
    item.tokenBalance = 0;
    item.valueBalance = 0;
  }

  return (
    <TableRow key={farm}>
      <TableCell className={classes.farmTableCell}>
        <div className={clsx(classes.cardTitle, classes.tableAsset)}>
          <Avatar variant="square" src={icon} className={classes.farmIcon} />
          {farmName}
        </div>
      </TableCell>
      <TableCell className={classes.farmTableCell}>
        <div className={clsx(classes.cardTitle, classes.cardContent)}>
          {formatNumber(item.tokenBalance)}
        </div>
      </TableCell>
      <TableCell className={classes.farmTableCell}>
        <div className={clsx(classes.cardTitle, classes.cardContent)}>
          {`${getUSD(item.valueBalance)}`}
        </div>
      </TableCell>
      {isFarm && (
        <Tooltip
          title={
            <span>
              {t("info.pickleApy", { percent: (item.apy * 100).toFixed(2) })}
            </span>
          }
        >
          <TableCell className={classes.farmTableCell}>
            <div className={clsx(classes.cardTitle, classes.cardContent)}>
              <Avatar
                variant="square"
                src="./assets/pickle.png"
                className={classes.emissionIcon}
              />
              {`${picklePerDay.toFixed(3)}`} / day
            </div>
          </TableCell>
        </Tooltip>
      )}
      <Tooltip
        title={
          <span>
            {t("info.daily", {
              percent: `${((isFarm ? jar.oneDayFarm : jar.oneDay) / 365).toFixed(2)}`,
            })}
          </span>
        }
      >
        <TableCell className={classes.farmTableCell}>
          <div className={clsx(classes.cardTitle, classes.cardContent)}>
            {isFarm
              ? jar.oneDayFarm
                ? `${jar.oneDayFarm.toFixed(2)}%`
                : "-"
              : jar.oneDay
              ? `${jar.oneDay.toFixed(2)}%`
              : "-"}
          </div>
        </TableCell>
      </Tooltip>
      <Tooltip
        title={
          <span>
            {t("info.weekly", {
              percent: (
                (isFarm ? jar.sevenDayFarm : jar.sevenDay) / 52).toFixed(2),
            })}
          </span>
        }
      >
        <TableCell className={classes.farmTableCell}>
          <div className={clsx(classes.cardTitle, classes.cardContent)}>
            {isFarm
              ? jar.sevenDayFarm
                ? `${jar.sevenDayFarm.toFixed(2)}%`
                : "-"
              : jar.sevenDay
              ? `${jar.sevenDay.toFixed(2)}%`
              : "-"}
          </div>
        </TableCell>
      </Tooltip>
      <Tooltip
        title={
          <span>
            {t("info.monthly", {
              percent: (
                (isFarm ? jar.thirtyDayFarm : jar.thirtyDay) / (365 / 30)
              ).toFixed(2),
            })}
          </span>
        }
      >
        <TableCell className={classes.farmTableCell}>
          <div className={clsx(classes.cardTitle, classes.cardContent)}>
            {isFarm
              ? jar.thirtyDayFarm
                ? `${jar.thirtyDayFarm.toFixed(2)}%`
                : "-"
              : jar.thirtyDay
              ? `${jar.thirtyDay.toFixed(2)}%`
              : "-"}
          </div>
        </TableCell>
      </Tooltip>
    </TableRow>
  );
};

const SkeletonChart = (props) => {
  const classes = useStyles();
  const { isFarm = true } = props;
  return (
    <>
      {Array.from({ length: props.length }, (c, i) => i).map((i) => {
        return (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className={classes.skeletonRow}>
                <Avatar
                  variant="square"
                  src={"./assets/pickle.png"}
                  className={classes.farmIcon}
                />
              </Skeleton>
            </TableCell>
            <TableCell>
              <Skeleton className={classes.skeletonRow}>
                <Avatar
                  variant="square"
                  src={"./assets/pickle.png"}
                  className={classes.farmIcon}
                />
              </Skeleton>
            </TableCell>
            <TableCell>
              <Skeleton className={classes.skeletonRow}>
                <Avatar
                  variant="square"
                  src={"./assets/pickle.png"}
                  className={classes.farmIcon}
                />
              </Skeleton>
            </TableCell>
            {isFarm && (
              <TableCell>
                <Skeleton className={classes.skeletonRow}>
                  <Avatar
                    variant="square"
                    src={"./assets/pickle.png"}
                    className={classes.farmIcon}
                  />
                </Skeleton>
              </TableCell>
            )}
            <TableCell>
              <Skeleton className={classes.skeletonRow}>
                <Avatar
                  variant="square"
                  src={"./assets/pickle.png"}
                  className={classes.farmIcon}
                />
              </Skeleton>
            </TableCell>
            <TableCell>
              <Skeleton className={classes.skeletonRow}>
                <Avatar
                  variant="square"
                  src={"./assets/pickle.png"}
                  className={classes.farmIcon}
                />
              </Skeleton>
            </TableCell>
            <TableCell>
              <Skeleton className={classes.skeletonRow}>
                <Avatar
                  variant="square"
                  src={"./assets/pickle.png"}
                  className={classes.farmIcon}
                />
              </Skeleton>
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
};

const FarmHeader = (props) => {
  const classes = useStyles();
  const { isFarm = true } = props;
  const { t } = useTranslation("common");
  const target = isFarm ? t("info.farm") : t("info.jar");

  return (
    <TableHead>
      <TableRow>
        <TableCell className={classes.farmTableCell}>
          <div className={classes.cardTitle}>{target}</div>
        </TableCell>
        <Tooltip
          className={classes.cardTitle}
          title={
            <span>
              {t("info.currentTokenBalance", {
                target,
              })}
            </span>
          }
        >
          <TableCell className={classes.farmTableCell}>
            {t("info.tokens")}
          </TableCell>
        </Tooltip>
        <Tooltip
          className={classes.cardTitle}
          title={
            <span>
              {t("info.currentUsdValue", {
                target,
              })}
            </span>
          }
        >
          <TableCell className={classes.farmTableCell}>
            {t("info.value")}
          </TableCell>
        </Tooltip>
        {isFarm && (
          <TableCell className={classes.farmTableCell}>
            <div className={classes.cardTitle}>Pickle / $1000</div>
          </TableCell>
        )}
        <Tooltip
          className={classes.cardTitle}
          title={<span>{t("info.dayApy")}</span>}
        >
          <TableCell className={classes.farmTableCell}>
            {t("info.day")}
          </TableCell>
        </Tooltip>
        <Tooltip
          className={classes.cardTitle}
          title={<span>{t("info.weeklyApy")}</span>}
        >
          <TableCell className={classes.farmTableCell}>
            {t("info.week")}
          </TableCell>
        </Tooltip>
        <Tooltip
          className={classes.cardTitle}
          title={<span>{t("info.monthlyApy")}</span>}
        >
          <TableCell className={classes.farmTableCell}>
            {t("info.month")}
          </TableCell>
        </Tooltip>
      </TableRow>
    </TableHead>
  );
};

// helper functions
const formatNumber = (value: number) => {
  if (value < 1) {
    return value.toFixed(8);
  } else {
    return value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
};
const getUSD = (value: number) => {
  return `$${formatNumber(value)}`;
};
export default function Brining() {
  const classes = useStyles();

  const [picklePerBlock, setPicklePerBlock] = useState(undefined);
  const [jarInfo, setJarInfo] = useState(undefined);
  const [farmInfo, setFarmInfo] = useState(undefined);
  const [stakingInfo, setStakingInfo] = useState(undefined);
  const [protocolInfo, setProtocolInfo] = useState(undefined);
  const [pickleData, setPickleData] = useState(undefined);
  const { t } = useTranslation("common");

  useEffect(() => {
    const updateProtocol = async () => setProtocolInfo(await getProtocolData());
    const updateStaking = async () => setStakingInfo(await getStakingData());
    const updateJars = async () =>
      setJarInfo(await getPerformanceData(jarOptions));
    const updateFarms = async () => {
      const farms = await getFarmData();
      setPicklePerBlock(farms.picklePerBlock);
      delete farms.picklePerBlock;
      setFarmInfo(farms);
    };
    const updatePickleData = async () =>
      setPickleData(await getCoinData("pickle-finance"));
    const updateInfo = async () => {
      updateProtocol();
      updateStaking();
      updateFarms();
      updateJars();
      updatePickleData();
    };

    updateInfo();
    const interval = setInterval(() => updateInfo(), 600000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Page>
        <InfoBar />
        <Grid container spacing={5} className={classes.pickleHeader}>
          <Grid item xs={12} sm={6}>
            <Card>
              <h2>{t("balances.totalValueLocked")}</h2>
              <DataPoint>
                <span>
                  {protocolInfo ? getUSD(protocolInfo.totalValue) : "--"}
                </span>
              </DataPoint>
              <Card.Footer>
                {protocolInfo
                  ? `${t("info.jarValueLocked")}: ${getUSD(
                      protocolInfo.jarValue,
                    )}`
                  : "--"}
              </Card.Footer>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card>
              <h2>
                <img
                  src="/pickle.png"
                  style={{ width: "24px", verticalAlign: `text-bottom` }}
                />{" "}
                {t("info.picklePrice")}
              </h2>
              <DataPoint>
                <span>
                  {pickleData
                    ? `$${pickleData.market_data.current_price.usd}`
                    : undefined}
                </span>
              </DataPoint>
              <Card.Footer>
                {pickleData
                  ? `${t("info.dailyVolume")}: ${getUSD(
                      pickleData.market_data.total_volume.usd,
                    )}`
                  : undefined}
              </Card.Footer>
            </Card>
          </Grid>
        </Grid>
        <h1>{t("info.farms")}</h1>
        <TableContainer component={Paper} className={classes.farmTable}>
          <Table className={classes.table}>
            <FarmHeader />
            <TableBody>
              {farmInfo && jarInfo ? (
                Object.keys(farmInfo)
                  .sort(
                    (a, b) => farmInfo[b].allocShare - farmInfo[a].allocShare,
                  )
                  .map((farm, i) => {
                    const item = farmInfo[farm];
                    const jar = jarInfo.find(
                      (jar) => jar.asset.toLowerCase() === farm,
                    );
                    return jar ? (
                      <FarmRow key={farm} farm={farm} item={item} jar={jar} />
                    ) : null;
                  })
              ) : (
                <SkeletonChart length={8} />
              )}
              <TableRow>
                <TableCell colSpan={8} className={classes.disclaimer}>
                  {t("info.emissionRate", {
                    count: picklePerBlock ? picklePerBlock.toFixed(4) : "-",
                  })}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <h1>{t("info.jars")}</h1>
        <TableContainer component={Paper} className={classes.farmTable}>
          <Table className={classes.table}>
            <FarmHeader isFarm={false} />
            <TableBody>
              {protocolInfo && farmInfo && jarInfo ? (
                jarInfo
                  .filter((jar) => jar.asset.toLowerCase() !== "pickle-eth")
                  .sort((a, b) => {
                    const aBalance = protocolInfo[a.asset.toLowerCase()];
                    const bBalance = protocolInfo[b.asset.toLowerCase()];
                    return bBalance - aBalance;
                  })
                  .map((jar, i) => {
                    const key = jar.asset.toLowerCase();
                    const itemTokenBalance = protocolInfo[key + "Tokens"];
                    const itemBalance = protocolInfo[key];
                    const item = {
                      tokenBalance: itemTokenBalance,
                      valueBalance: itemBalance,
                    };
                    return (
                      <FarmRow
                        key={jar.asset}
                        farm={jar.asset}
                        item={item}
                        jar={jar}
                        isFarm={false}
                      />
                    );
                  })
              ) : (
                <SkeletonChart length={7} isFarm={false} />
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Footer />
      </Page>
    </>
  );
}

export { getStaticProps } from "../util/locales";
