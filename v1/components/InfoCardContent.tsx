import React from "react";
import { styled } from '@mui/material/styles';
import Avatar from "@mui/material/Avatar";
import { Skeleton } from "@mui/material";

const PREFIX = 'V1ComponentsInfoCardContent'
const classes = {
  cardInfo: `${PREFIX}-cardInfo`,
  cardTitle: `${PREFIX}-cardTitle`,
  cardValue: `${PREFIX}-cardValue`,
  cardSubText: `${PREFIX}-cardSubText`,
  cardIcon: `${PREFIX}-cardIcon`,
  cardContent: `${PREFIX}-cardContent`,
}

const CustomDiv = styled('div')(({theme})=>({
  [`& .${classes.cardInfo}`]: {
    display: "flex",
    flexDirection: "column",
  },
  [`& .${classes.cardTitle}`]: {
    fontSize: "1rem",
  },
  [`& .${classes.cardValue}`]: {
    fontSize: "1.6rem",
    letterSpacing: "2px",
  },
  [`& .${classes.cardSubText}`]: {
    fontSize: ".8rem",
  },
  [`& .${classes.cardIcon}`]: {
    marginRight: theme.spacing(3),
    marginLeft: theme.spacing(3),
  },
  [`& .${classes.cardContent}`]: {
    display: "flex",
    alignItems: "center",
  },
}))

export default function InfoCardContent(props) {

  return (
    <CustomDiv className={classes.cardContent}>
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
    </CustomDiv>
  );
}
