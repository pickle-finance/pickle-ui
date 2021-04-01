import {
  makeStyles,
  createMuiTheme,
  ThemeProvider,
} from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import Skeleton from "@material-ui/lab/Skeleton";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import CardContent from "@material-ui/core/CardContent";
import { Page, Input } from "@geist-ui/react";
import {
  getUserEarnings,
  getCoinData,
  formatUsd,
  getFarmData,
} from "../../util/api";
import {
  cardColor,
  pickleGreen,
  materialBlack,
  pickleWhite,
} from "../../util/constants";
import InfoCardContent from "../../components/InfoCardContent";
import EarnRow from "../../components/EarnRow";
import ThemedTable from "../../components/ThemedTable";
import { jars } from "../../util/jars";
import { Connection } from "../../containers/Connection";
import { TopBar } from "../../features/TopBar/TopBar";
import { InfoBar } from "../../features/InfoBar/InfoBar";
import { Footer } from "../../features/Footer/Footer";

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

export default function Earn(props) {
  const classes = useStyles();

  const { address } = Connection.useContainer();
  const [account, setAccount] = useState(address);
  const [accountData, setAccountData] = useState(undefined);

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
      const heldPositions = accountInfo.jarEarnings.filter(
        (jar) => jar.balance > 0,
      );
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
      .filter((jar) => jar.earnedUsd > 0)
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
      <TopBar />
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
                      title={"Deposited Balance"}
                      value={
                        accountData
                          ? formatUsd(accountData.balance)
                          : accountData
                      }
                      subtext="Current USD Value"
                      icon={"/assets/vault.png"}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <InfoCardContent
                      title={"Earnings"}
                      value={
                        accountData
                          ? formatUsd(accountData.earnings)
                          : accountData
                      }
                      subtext="Lifetime USD Value"
                      icon={"/assets/coin.png"}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <InfoCardContent
                      title={"Daily Emission"}
                      value={accountData ? accountData.earn : accountData}
                      subtext="Pickle per day"
                      icon={"/assets/pickle.png"}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6} className={classes.gridItem}>
                <h1>Assets</h1>
                <ThemedTable
                  headers={["Asset", "Tokens", "Value"]}
                  rows={assetRows}
                />
              </Grid>
              <Grid item xs={12} md={6} className={classes.gridItem}>
                <h1>Earnings</h1>
                <ThemedTable
                  headers={["Asset", "Earned Tokens", "Value"]}
                  rows={earnRows}
                />
              </Grid>
            </Grid>
          </>
        )}
        {!account && (
          <div className={classes.address}>
            How are you brining?
            <Input
              id="account"
              label="Address"
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
