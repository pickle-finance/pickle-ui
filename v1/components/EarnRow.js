import React from "react";
import { makeStyles } from "@mui/material/styles";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Avatar from "@mui/material/Avatar";
import { materialBlack } from "../util/constants";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  asettIcon: {
    height: "25px",
    width: "25px",
    marginRight: theme.spacing(2),
  },
  asset: {
    display: "flex",
  },
  tableCell: {
    borderBottom: "none",
    color: materialBlack,
    fontSize: "1.1rem",
  },
}));

export default function EarnRow(props) {
  const classes = useStyles();
  const { asset, icon, earned, value } = props;

  return (
    <TableRow>
      <TableCell className={clsx(classes.asset, classes.tableCell)}>
        <Avatar variant="square" src={icon} className={classes.asettIcon} />
        {asset}
      </TableCell>
      <TableCell align="right" className={classes.tableCell}>
        {earned}
      </TableCell>
      <TableCell align="right" className={classes.tableCell}>
        {value}
      </TableCell>
    </TableRow>
  );
}
