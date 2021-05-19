import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import styled from "styled-components";
import Typography from "@material-ui/core/Typography";
import { Card } from "@geist-ui/react";
import CardContent from "@material-ui/core/CardContent";
import Tooltip from "@material-ui/core/Tooltip";
import Container from "@material-ui/core/Container";
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
import { TopBar } from "../features/TopBar/TopBar";
import { InfoBar } from "../features/InfoBar/InfoBar";
import { Footer } from "../features/Footer/Footer";
import { Jars } from "../containers/Jars-Ethereum";
import { UniV2Pairs } from "../containers/UniV2Pairs";
import {
  backgroundColor,
  cardColor,
  pickleGreen,
  pickleWhite,
  materialBlack,
} from "../util/constants";
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
        <Tooltip title={`${(item.apy * 100).toFixed(2)}% pickle apy`}>
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
        title={`${((isFarm ? jar.oneDayFarm : jar.oneDay) / 365).toFixed(
          2,
        )}% daily`}
      >
        <TableCell className={classes.farmTableCell}>
          <div className={clsx(classes.cardTitle, classes.cardContent)}>
            {isFarm
              ? jar.oneDayFarm
                ? `${jar.oneDayFarm}%`
                : "-"
              : jar.oneDay
              ? `${jar.oneDay}%`
              : "-"}
          </div>
        </TableCell>
      </Tooltip>
      <Tooltip
        title={`${((isFarm ? jar.sevenDayFarm : jar.sevenDay) / 52).toFixed(
          2,
        )}% weekly`}
      >
        <TableCell className={classes.farmTableCell}>
          <div className={clsx(classes.cardTitle, classes.cardContent)}>
            {isFarm
              ? jar.sevenDayFarm
                ? `${jar.sevenDayFarm}%`
                : "-"
              : jar.sevenDay
              ? `${jar.sevenDay}%`
              : "-"}
          </div>
        </TableCell>
      </Tooltip>
      <Tooltip
        title={`${(
          (isFarm ? jar.thirtyDayFarm : jar.thirtyDay) /
          (365 / 30)
        ).toFixed(2)}% monthly`}
      >
        <TableCell className={classes.farmTableCell}>
          <div className={clsx(classes.cardTitle, classes.cardContent)}>
            {isFarm
              ? jar.thirtyDayFarm
                ? `${jar.thirtyDayFarm}%`
                : "-"
              : jar.thirtyDay
              ? `${jar.thirtyDay}%`
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
  return (
    <TableHead>
      <TableRow>
        <TableCell className={classes.farmTableCell}>
          <div className={classes.cardTitle}>{isFarm ? "Farm" : "Jar"}</div>
        </TableCell>
        <Tooltip
          className={classes.cardTitle}
          title={`Current deposit token balance in ${isFarm ? "Farm" : "Jar"}`}
        >
          <TableCell className={classes.farmTableCell}>Tokens</TableCell>
        </Tooltip>
        <Tooltip
          className={classes.cardTitle}
          title={`Current USD value in ${isFarm ? "Farm" : "Jar"}`}
        >
          <TableCell className={classes.farmTableCell}>Value</TableCell>
        </Tooltip>
        {isFarm && (
          <TableCell className={classes.farmTableCell}>
            <div className={classes.cardTitle}>Pickle / $1000</div>
          </TableCell>
        )}
        <Tooltip className={classes.cardTitle} title="Current day APY">
          <TableCell className={classes.farmTableCell}>Day</TableCell>
        </Tooltip>
        <Tooltip className={classes.cardTitle} title="Weekly APY">
          <TableCell className={classes.farmTableCell}>Week</TableCell>
        </Tooltip>
        <Tooltip className={classes.cardTitle} title="Monthly APY">
          <TableCell className={classes.farmTableCell}>Month</TableCell>
        </Tooltip>
      </TableRow>
    </TableHead>
  );
};

// helper functions
const formatNumber = (value) => {
  if (value < 1) {
    return value.toFixed(8);
  } else {
    return value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
};
const getUSD = (value) => {
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
  const [liquidity, setLiquidity] = useState<number | null>(null);

  const { getPairData } = UniV2Pairs.useContainer();
  const { jars: pickleJars } = Jars.useContainer();

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
    const getLiquidity = async () => {
      if (getPairData) {
        const { totalValueOfPair } = await getPairData(
          "0xdc98556Ce24f007A5eF6dC1CE96322d65832A819",
        );
        setLiquidity(totalValueOfPair);
      }
    };
    getLiquidity();
    updateInfo();
    const interval = setInterval(() => updateInfo(), 600000);
    return () => clearInterval(interval);
  }, []);

  let totalValueLocked = null;
  if (pickleJars) {
    totalValueLocked = pickleJars.reduce((acc, x) => {
      return acc + (x?.tvlUSD || 0);
    }, liquidity || 0);
  }

  return (
    <>
      <TopBar />
      <Page>
        <InfoBar />
        <Grid container spacing={5} className={classes.pickleHeader}>
          <Grid item xs={12} sm={6}>
            <Card>
              <h2>Total Value Locked</h2>
              <DataPoint>
                <span>
                  {totalValueLocked ? getUSD(totalValueLocked) : "--"}
                </span>
              </DataPoint>
              <Card.Footer>
                {totalValueLocked
                  ? `Jar Value Locked: ${getUSD(totalValueLocked - liquidity)}`
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
                Pickle Price
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
                  ? `Daily Volume: ${getUSD(
                      pickleData.market_data.total_volume.usd,
                    )}`
                  : undefined}
              </Card.Footer>
            </Card>
          </Grid>
        </Grid>
        <h1>Farms</h1>
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
                  Emission Rate:{" "}
                  {picklePerBlock ? picklePerBlock.toFixed(4) : "-"} pickle per
                  block
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <h1>Jars</h1>
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
