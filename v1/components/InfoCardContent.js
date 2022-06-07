import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Skeleton from "@material-ui/lab/Skeleton";

const useStyles = makeStyles((theme) => ({
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
  cardIcon: {
    marginRight: theme.spacing(3),
    marginLeft: theme.spacing(3),
  },
  cardContent: {
    display: "flex",
    alignItems: "center",
  },
}));

export default function InfoCardContent(props) {
  const classes = useStyles();

  return (
    <div className={classes.cardContent}>
      <Avatar variant="rounded" src={props.icon} className={classes.cardIcon} />
      <div className={classes.cardInfo}>
        <div className={classes.cardTitle}>{props.title}</div>
        <div className={classes.cardValue}>
          {props.value !== undefined ? props.value : <Skeleton />}
        </div>
        <div className={classes.cardSubText}>
          {props.subtext !== undefined ? props.subtext : <Skeleton />}
        </div>
      </div>
    </div>
  );
}
