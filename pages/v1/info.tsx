import React, { useEffect, useState } from "react";
import { styled } from '@mui/material/styles';
import { Card } from "@geist-ui/core";
import Tooltip from "@mui/material/Tooltip";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import { Skeleton } from "@mui/material";
import TableBody from "@mui/material/TableBody";
import TableHead from "@mui/material/TableHead";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Table from "@mui/material/Table";
import Paper from "@mui/material/Paper";
import Image from 'next/image'
import { Page } from "@geist-ui/core";
import { useTranslation } from "next-i18next";
import clsx from "clsx";

import { InfoBar } from "v1/features/InfoBar/InfoBar";
import { Footer } from "v1/features/Footer/Footer";
import { pickleGreen, materialBlack } from "v1/util/constants";
import { getProtocolData, getFarmData, getPerformanceData, getCoinData } from "v1/util/api";
import { powerPool, jars } from "v1/util/jars";

const PREFIX = "V1Info"
const classes = {
  root: `${PREFIX}-root`,
  claimContent: `${PREFIX}-claimContent`,
  claimLink: `${PREFIX}-claimLink`,
  warning: `${PREFIX}-warning`,
  warningContent: `${PREFIX}-warningContent`,
  warningLink: `${PREFIX}-warningLink`,
  card: `${PREFIX}-card`,
  cardContent: `${PREFIX}-cardContent`,
  tableAsset: `${PREFIX}-tableAsset`,
  cardIcon: `${PREFIX}-cardIcon`,
  cardInfo: `${PREFIX}-cardInfo`,
  cardTitle: `${PREFIX}-cardTitle`,
  cardValue: `${PREFIX}-cardValue`,
  cardSubText: `${PREFIX}-cardSubText`,
  tagline: `${PREFIX}-tagline`,
  subtitle: `${PREFIX}-subtitle`,
  farmTable: `${PREFIX}-farmTable`,
  farmTableCell: `${PREFIX}-farmTableCell`,
  farmIcon: `${PREFIX}-farmIcon`,
  emissionIcon: `${PREFIX}-emissionIcon`,
  disclaimer: `${PREFIX}-disclaimer`,
  skeletonRow: `${PREFIX}-skeletonRow`,
  pickleHeader: `${PREFIX}-pickleHeader`,
}

const jarOptions = jars.concat([powerPool]);

const DataPoint = styled('div')`
  font-size: 24px;
  display: flex;
  align-items: center;
`;

const FarmTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${classes.farmTableCell}`]: {
    color: materialBlack,
    borderBottom: "1px solid gray",
  },
  [`& .${classes.cardTitle}`]: {
    fontSize: "1rem",
  },
  [`& .${classes.cardContent}`]: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  [`& .${classes.emissionIcon}`]: {
    marginRight: theme.spacing(1),
    height: "15px",
    width: "15px",
  },
  [`& .${classes.farmIcon}`]: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(3),
    height: "25px",
    width: "25px",
  },
  [`& .${classes.skeletonRow}`]: {
    backgroundColor: "darkgreen",
    opacity: "30%",
  },
  [`& .${classes.tableAsset}`]: {
    display: "flex",
    alignItems: "center",
  },
}))

const PickleHeaderGrid = styled(Grid)(({ theme }) => ({
  [`&.${classes.pickleHeader}`]: {
    maxWidth: "80%",
    margin: "auto",
  },
}))

const CardTitleTooltip = styled(Tooltip)(({ theme }) => ({
  [`&.${classes.cardTitle}`]: {
    fontSize: "1rem",
  },
}))

const FarmTableContainer = styled(TableContainer)(({ theme }) => ({
  [`&.${classes.farmTable}`]: {
    backgroundColor: "#0e1d15",
    borderTopLeftRadius: "3px",
    borderTopRightRadius: "3px",
    border: `1px solid ${pickleGreen}`,
  },
}))

const PicklePerDayCell = (props: any) => {
  const { t } = useTranslation("common");
  const { val, precision, apy } = props;

  return (
    <Tooltip title={<span>{t("info.pickleApy", { percent: (apy * 100).toFixed(2) })}</span>}>
      <FarmTableCell className={classes.farmTableCell}>
        <div className={clsx(classes.cardTitle, classes.cardContent)}>
          <Avatar variant="square" src="/assets/pickle.png" className={classes.emissionIcon} />
          {val.toFixed(precision)} / day
        </div>
      </FarmTableCell>
    </Tooltip>
  );
};

const ApyCell = (props: any) => {
  const { t } = useTranslation("common");
  // const classes = useStyles();
  const { val, jarIndex, farmIndex, isFarm, precision } = props;
  let cellData = "-";

  if (isFarm && val[farmIndex]) {
    cellData = `${val[farmIndex].toFixed(precision)}%`;
  } else if (val[jarIndex]) {
    cellData = `${val[jarIndex].toFixed(precision)}%`;
  }

  return (
    <FarmTableCell className={classes.farmTableCell}>
      <div className={clsx(classes.cardTitle, classes.cardContent)}>{cellData}</div>
    </FarmTableCell>
  );
};

const TooltipAndApyCell = (props: any) => {
  const { t } = useTranslation("common");
  const { val, frequency, jarIndex, farmIndex, isFarm, Ndays, precision } = props;
  const tooltipTitle = () => {
    return (
      <span>
        {t(frequency, {
          percent: `${((isFarm ? val[farmIndex] : val[jarIndex]) / (365 / Ndays)).toFixed(
            precision,
          )}`,
        })}
      </span>
    );
  };
  return <Tooltip title={tooltipTitle()}>{ApyCell(props)}</Tooltip>;
};

const FarmRow = (props: any) => {
  // const classes = useStyles();
  const { t } = useTranslation("common");

  const { farm, item, jar, isFarm = true } = props;
  const farmName = jarOptions.find((jar) => jar.toLowerCase() === farm.toLowerCase());
  const icon = `/assets/${farm.toLowerCase()}.png`;
  const picklePerDay = (1000 / item.valueBalance) * item.picklePerDay;

  if (!item.tokenBalance && !item.valueBalance) {
    item.tokenBalance = 0;
    item.valueBalance = 0;
  }

  return (
    <TableRow key={farm}>
      <FarmTableCell className={classes.farmTableCell}>
        <div className={clsx(classes.cardTitle, classes.tableAsset)}>
          <Avatar variant="square" src={icon} className={classes.farmIcon} />
          {farmName}
        </div>
      </FarmTableCell>
      <FarmTableCell className={classes.farmTableCell}>
        <div className={clsx(classes.cardTitle, classes.cardContent)}>
          {formatNumber(item.tokenBalance)}
        </div>
      </FarmTableCell>
      <FarmTableCell className={classes.farmTableCell}>
        <div className={clsx(classes.cardTitle, classes.cardContent)}>
          {`${getUSD(item.valueBalance)}`}
        </div>
      </FarmTableCell>
      {isFarm && <PicklePerDayCell apy={item.apy} val={picklePerDay} precision="3" />}
      <TooltipAndApyCell
        val={jar}
        frequency="info.daily"
        jarIndex="oneDay"
        farmIndex="oneDayFarm"
        isFarm={isFarm}
        Ndays="1"
        precision="2"
      />
      <TooltipAndApyCell
        val={jar}
        frequency="info.weekly"
        jarIndex="sevenDay"
        farmIndex="sevenDayFarm"
        isFarm={isFarm}
        Ndays="7"
        precision="2"
      />
      <TooltipAndApyCell
        val={jar}
        frequency="info.monthly"
        jarIndex="thirtyDay"
        farmIndex="thirtyDayFarm"
        isFarm={isFarm}
        Ndays="30"
        precision="2"
      />
    </TableRow>
  );
};

const SkeletonCell = () => {
  // const classes = useStyles();
  return (
    <FarmTableCell>
      <Skeleton className={classes.skeletonRow}>
        <Avatar variant="square" src={"/assets/pickle.png"} className={classes.farmIcon} />
      </Skeleton>
    </FarmTableCell>
  );
};

const SkeletonChart = (props: any) => {
  // const classes = useStyles();
  const { isFarm = true } = props;
  return (
    <>
      {Array.from({ length: props.length }, (c, i) => i).map((i) => {
        return (
          <TableRow key={i}>
            <SkeletonCell />
            <SkeletonCell />
            <SkeletonCell />
            <SkeletonCell />
            {isFarm && <SkeletonCell />}
            <SkeletonCell />
            <SkeletonCell />
            <SkeletonCell />
          </TableRow>
        );
      })}
    </>
  );
};

const FarmHeaderTooltipAndCell = (props: any) => {
  // const classes = useStyles();
  const { tooltipTitleText, cellData, target, isFarm = true } = props;
  const { t } = useTranslation("common");

  const tooltipTitle = () => {
    return <span>{t(tooltipTitleText, { target })}</span>;
  };
  return (
    <CardTitleTooltip className={classes.cardTitle} title={tooltipTitle()}>
      <FarmTableCell className={classes.farmTableCell}>{t(cellData)}</FarmTableCell>
    </CardTitleTooltip>
  );
};

const FarmHeader = (props: any) => {
  // const classes = useStyles();
  const { isFarm = true } = props;
  const { t } = useTranslation("common");
  const target = isFarm ? t("info.farm") : t("info.jar");

  return (
    <TableHead>
      <TableRow>
        <FarmTableCell className={classes.farmTableCell}>
          <div className={classes.cardTitle}>{target}</div>
        </FarmTableCell>
        <FarmHeaderTooltipAndCell
          tooltipTitleText="info.currentTokenBalance"
          target={target}
          cellData="info.tokens"
        />
        <FarmHeaderTooltipAndCell
          tooltipTitleText="info.currentUsdValue"
          target={target}
          cellData="info.value"
        />
        {isFarm && (
          <FarmTableCell className={classes.farmTableCell}>
            <div className={classes.cardTitle}>Pickle / $1000</div>
          </FarmTableCell>
        )}
        <FarmHeaderTooltipAndCell
          tooltipTitleText="info.dayApy"
          target={target}
          cellData="info.day"
        />
        <FarmHeaderTooltipAndCell
          tooltipTitleText="info.weeklyApy"
          target={target}
          cellData="info.week"
        />
        <FarmHeaderTooltipAndCell
          tooltipTitleText="info.monthlyApy"
          target={target}
          cellData="info.month"
        />
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
  // const classes = useStyles();

  const [picklePerBlock, setPicklePerBlock] = useState(undefined);
  const [jarInfo, setJarInfo] = useState(undefined);
  const [farmInfo, setFarmInfo] = useState(undefined);
  const [protocolInfo, setProtocolInfo] = useState(undefined);
  const [pickleData, setPickleData] = useState(undefined);
  const { t } = useTranslation("common");

  useEffect(() => {
    const updateProtocol = async () => setProtocolInfo(await getProtocolData());
    const updateJars = async () => setJarInfo(await getPerformanceData(jarOptions));
    const updateFarms = async () => {
      const farms = await getFarmData();
      setPicklePerBlock(farms.picklePerBlock);
      delete farms.picklePerBlock;
      setFarmInfo(farms);
    };
    const updatePickleData = async () => setPickleData(await getCoinData("pickle-finance"));
    const updateInfo = async () => {
      updateProtocol();
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
        <PickleHeaderGrid container spacing={5} className={classes.pickleHeader}>
          <Grid item xs={12} sm={6}>
            <Card>
              <h2>{t("balances.totalValueLocked")}</h2>
              <DataPoint>
                <span>{protocolInfo ? getUSD(protocolInfo.totalValue) : "--"}</span>
              </DataPoint>
              <Card.Footer>
                {protocolInfo
                  ? `${t("info.jarValueLocked")}: ${getUSD(protocolInfo.jarValue)}`
                  : "--"}
              </Card.Footer>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card>
              <h2>
                <Image src="/pickle.png" alt="" style={{ width: "24px", verticalAlign: `text-bottom` }} />{" "}
                {t("info.picklePrice")}
              </h2>
              <DataPoint>
                <span>
                  {pickleData ? `$${pickleData.market_data.current_price.usd}` : undefined}
                </span>
              </DataPoint>
              <Card.Footer>
                {pickleData
                  ? `${t("info.dailyVolume")}: ${getUSD(pickleData.market_data.total_volume.usd)}`
                  : undefined}
              </Card.Footer>
            </Card>
          </Grid>
        </PickleHeaderGrid>
        <h1>{t("info.farms")}</h1>
        <FarmTableContainer component={Paper} className={classes.farmTable}>
          <Table>
            <FarmHeader />
            <TableBody>
              {farmInfo && jarInfo ? (
                Object.keys(farmInfo)
                  .sort((a, b) => farmInfo[b].allocShare - farmInfo[a].allocShare)
                  .map((farm, i) => {
                    const item = farmInfo[farm];
                    const jar = jarInfo.find((jar: any) => jar.asset.toLowerCase() === farm);
                    return jar ? <FarmRow key={farm} farm={farm} item={item} jar={jar} /> : null;
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
        </FarmTableContainer>
        <h1>{t("info.jars")}</h1>
        <FarmTableContainer component={Paper} className={classes.farmTable}>
          <Table>
            <FarmHeader isFarm={false} />
            <TableBody>
              {protocolInfo && farmInfo && jarInfo ? (
                jarInfo
                  .filter((jar: any) => jar.asset.toLowerCase() !== "pickle-eth")
                  .sort((a: any, b: any) => {
                    const aBalance = protocolInfo[a.asset.toLowerCase()];
                    const bBalance = protocolInfo[b.asset.toLowerCase()];
                    return bBalance - aBalance;
                  })
                  .map((jar: any, i: any) => {
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
        </FarmTableContainer>
        <Footer />
      </Page>
    </>
  );
}

export { getStaticProps } from "v1/util/locales";
