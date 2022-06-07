import { makeStyles, createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import Skeleton from "@material-ui/lab/Skeleton";
import Card from "@material-ui/core/Card";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import CardContent from "@material-ui/core/CardContent";
import { Page, Input } from "@geist-ui/react";
import { useTranslation } from "next-i18next";

import { getUserEarnings, getCoinData, formatUsd, getFarmData } from "../../../v1/util/api";
import { cardColor, pickleGreen, materialBlack, pickleWhite } from "../../../v1/util/constants";
import InfoCardContent from "../../../v1/components/InfoCardContent";
import EarnRow from "../../../v1/components/EarnRow";
import ThemedTable from "../../../v1/components/ThemedTable";
import { jars } from "../../../v1/util/jars";
import { Connection } from "../../../v1/containers/Connection";
import { InfoBar } from "../../../v1/features/InfoBar/InfoBar";
import { Footer } from "../../../v1/features/Footer/Footer";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: cardColor,
      light: pickleGreen,
    },
  },
});
const useStyles = makeStyles((theme) => ({
  wallet: {
    fontSize: "1.2rem",
    backgroundColor: "#0e1d15",
    boxShadow: `0px 3px ${pickleGreen}`,
    border: `1px solid ${pickleGreen}`,
    color: pickleWhite,
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down("md")]: {
      fontSize: ".6rem",
    },
  },
  balance: {
    display: "flex",
    flexDirection: "row",
    marginRight: theme.spacing(3),
    fontSize: "1.5rem",
  },
  balanceSkeleton: {
    width: "175px",
    marginLeft: theme.spacing(1),
  },
  earnHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    height: "40px",
  },
  jarCardContainer: {
    display: "flex",
  },
  jarCard: {
    fontSize: "1.4rem",
    color: materialBlack,
  },
  address: {
    display: "flex",
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    fontSize: "2rem",
  },
  addressInput: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    color: pickleWhite,
  },
  pickle: {
    maxHeight: "100%",
    maxWidth: "100%",
    height: "auto",
    width: "auto",
  },
}));

export default function Earn() {
  const classes = useStyles();

  const { address } = Connection.useContainer();
  const [account, setAccount] = useState(address);
  const [accountData, setAccountData] = useState(undefined);
  const { t } = useTranslation("common");

  useEffect(() => {
    account ? setAccount(account) : setAccount(address);
  }, account);

  useEffect(() => {
    const updateAccountData = async () => {
      const responseData = await Promise.all([
        getUserEarnings(account),
        getCoinData("pickle-finance"),
        getFarmData(),
      ]);
      const accountInfo = responseData[0];
      if (!accountInfo) {
        setAccountData({
          earn: 0,
          earnUsd: 0,
          balance: 0,
          earnings: 0,
          jarData: [],
        });
        return;
      }
      const pickle = responseData[1].market_data.current_price.usd;
      const farms = responseData[2];
      const heldPositions = accountInfo.jarEarnings.filter((jar) => jar.balance > 0);
      let balance = 0;
      let earn = 0;
      if (heldPositions.length > 0) {
        balance = heldPositions
          .map((p) => p.balanceUsd)
          .reduce((total, jarBalance) => total + jarBalance);
        earn = heldPositions
          .map((jar) => {
            let farm = farms[jar.asset.toLowerCase()];
            if (!farm) {
              return 0;
            }
            return (jar.balanceUsd / farm.valueBalance) * farm.picklePerDay;
          })
          .reduce((total, pickle) => total + pickle);
      }
      const earnUsd = earn * pickle;
      setAccountData({
        earn: earn.toFixed(3),
        earnUsd: earnUsd,
        balance: balance,
        earnings: accountInfo.earnings,
        jarData: accountInfo.jarEarnings,
      });
    };
    if (account) {
      updateAccountData();
      const interval = setInterval(() => updateAccountData(), 60000);
      return () => clearInterval(interval);
    }
  }, [account]);

  const getTokens = (tokens) => {
    if (tokens === 0) {
      return 0;
    }
    if (tokens < 1) {
      return tokens.toFixed(8);
    }
    return tokens.toFixed(3);
  };
  let assetRows;
  if (accountData) {
    assetRows = accountData.jarData
      .filter((jar) => jar.balance > 0)
      .map((jar, i) => {
        const jarInfo = jars.find((s) => s.asset === jar.asset.toLowerCase());
        return (
          <EarnRow
            asset={jarInfo ? jarInfo.title : jar.asset}
            earned={getTokens(jar.balance)}
            value={formatUsd(jar.balanceUsd)}
            icon={`/assets/${jar.asset.toLowerCase()}.png`}
            key={i}
          />
        );
      });
  }

  let earnRows;
  if (accountData) {
    earnRows = accountData.jarData
      .filter((jar) => jar.earnedUsd > 0 && jar.balance > 0)
      .map((jar, i) => {
        const jarInfo = jars.find((s) => s.asset === jar.asset.toLowerCase());
        return (
          <EarnRow
            asset={jarInfo ? jarInfo.title : jar.asset}
            earned={getTokens(jar.earned)}
            value={formatUsd(jar.earnedUsd)}
            icon={`/assets/${jar.asset.toLowerCase()}.png`}
            key={i}
          />
        );
      });
  }

  const handleAccount = (e) => {
    if (e.key === "Enter") {
      setAccount(e.target.value.toLowerCase());
    }
    e.target.value = e.target.value.toLowerCase();
  };

  return (
    <ThemeProvider theme={theme}>
      <Page>
        <InfoBar />
        {account && (
          <>
            <Card className={classes.wallet}>
              <CardContent>
                {!account ? (
                  <Skeleton className={classes.balanceSkeleton} />
                ) : (
                  <div className={classes.earnHeader}>
                    <Typography>{account}</Typography>
                  </div>
                )}
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <InfoCardContent
                      title={t("info.depositedBalance")}
                      value={
                        accountData
                          ? formatUsd(
                              accountData.jarData
                                .filter((jar) => jar.balance > 0)
                                .reduce((acc, jar) => {
                                  return acc + jar.balanceUsd;
                                }, 0),
                            )
                          : accountData
                      }
                      subtext={t("info.currentValue")}
                      icon={"/assets/vault.png"}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <InfoCardContent
                      title={t("info.earnings")}
                      value={accountData ? formatUsd(accountData.earnings) : accountData}
                      subtext={t("info.lifetimeValue")}
                      icon={"/assets/coin.png"}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <InfoCardContent
                      title={t("info.dailyEmission")}
                      value={accountData ? accountData.earn : accountData}
                      subtext={t("info.picklePerDay")}
                      icon={"/assets/pickle.png"}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6} className={classes.gridItem}>
                <h1>{t("info.assets")}</h1>
                <ThemedTable
                  headers={[t("info.asset"), t("info.tokens"), t("info.value")]}
                  rows={assetRows}
                />
              </Grid>
              <Grid item xs={12} md={6} className={classes.gridItem}>
                <h1>{t("info.earnings")}</h1>
                <ThemedTable
                  headers={[t("info.asset"), t("info.earnedTokens"), t("info.value")]}
                  rows={earnRows}
                />
              </Grid>
            </Grid>
          </>
        )}
        {!account && (
          <div className={classes.address}>
            {t("info.brining")}
            <Input
              id="account"
              label={t("info.address")}
              variant="outlined"
              className={classes.addressInput}
              onKeyDown={handleAccount}
              width="28rem"
            />
            <img src="/assets/jar.png" alt="" className={classes.pickle} />
          </div>
        )}
        <Footer />
      </Page>
    </ThemeProvider>
  );
}

export { getStaticProps } from "../../../v1/util/locales";
