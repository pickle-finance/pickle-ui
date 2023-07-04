import React from "react";
import { styled } from '@mui/material/styles';
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Avatar from "@mui/material/Avatar";
import { materialBlack } from "../util/constants";
import clsx from "clsx";

const PREFIX = 'V1ComponentEarnRow'
const classes = {
  asettIcon: `${PREFIX}-asettIcon`,
  asset: `${PREFIX}-asset`,
  tableCell: `${PREFIX}-tableCell`,
}

const CustomTableCell = styled(TableCell)(({theme})=>({
  [`& .${classes.asettIcon}`]: {
    height: "25px",
    width: "25px",
    marginRight: theme.spacing(2),
  },
  [`& .${classes.asset}`]: {
    display: "flex",
  },
  [`& .${classes.tableCell}`]: {
    borderBottom: "none",
    color: materialBlack,
    fontSize: "1.1rem",
  },
}))

export default function EarnRow(props) {
  const { asset, icon, earned, value } = props;

  return (
    <TableRow>
      <CustomTableCell className={clsx(classes.asset, classes.tableCell)}>
        <Avatar variant="square" src={icon} className={classes.asettIcon} />
        {asset}
      </CustomTableCell>
      <CustomTableCell align="right" className={classes.tableCell}>
        {earned}
      </CustomTableCell>
      <CustomTableCell align="right" className={classes.tableCell}>
        {value}
      </CustomTableCell>
    </TableRow>
  );
}
