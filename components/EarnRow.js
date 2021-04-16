import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Avatar from "@material-ui/core/Avatar";
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
