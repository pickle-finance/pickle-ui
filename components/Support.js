import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { Avatar } from "@material-ui/core";
import { pickleNeon } from "../util/constants";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  footer: {
    display: "flex",
    flexDirection: "column",
    color: pickleNeon,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(6),
  },
  footerItem: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: "0.6rem",
    letterSpacing: "3px",
    textTransform: "uppercase",
    textDecoration: "none",
    color: pickleNeon,
    margin: theme.spacing(1),
  },
  address: {
    letterSpacing: "2px",
    textTransform: "none",
  },
  pickle: {
    height: "15px",
    width: "15px",
    marginRight: "5px",
  },
}));

export default function Support() {
  const classes = useStyles();

  return (
    <div className={classes.footer}>
      <div className={classes.footerItem}>
        <Avatar
          variant="square"
          src={"./assets/pickle.png"}
          className={classes.pickle}
        />
        <Typography variant="caption">
          <a
            href="https://forms.gle/sXxBQcemyxAPGDJZ9"
            target="_blank"
            rel="noopener noreferrer"
            className={classes.footerText}
          >
            Feedback
          </a>
        </Typography>
        -
        <Typography variant="caption">
          <a
            href="https://gitcoin.co/grants/1510/pickle-jar-info"
            target="_blank"
            rel="noopener noreferrer"
            className={classes.footerText}
          >
            Support
          </a>
        </Typography>
        -
        <Typography variant="caption">
          <a
            href="https://pickle.fyi/"
            target="_blank"
            rel="noopener noreferrer"
            className={classes.footerText}
          >
            How To
          </a>
        </Typography>
        <Avatar
          variant="square"
          src={"./assets/pickle-mirror.png"}
          className={classes.pickle}
        />
      </div>
      <div className={classes.footerItem}>
        <Typography variant="caption">
          <a
            href="https://twitter.com/axejintao"
            target="_blank"
            rel="noopener noreferrer"
            className={classes.footerText}
          >
            Made with{" "}
            <span role="img" aria-label="heart">
              💚
            </span>{" "}
            by @axejintao
          </a>
        </Typography>
      </div>
      <div className={classes.footerItem}>
        <Typography variant="caption">
          <a
            href="https://etherscan.io/address/0xbb2281ca5b4d07263112604d1f182ad0ab26a252"
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(classes.footerText, classes.address)}
          >
            0xbb2281ca5b4d07263112604d1f182ad0ab26a252
          </a>
        </Typography>
      </div>
    </div>
  );
}
