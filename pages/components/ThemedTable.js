import React from "react";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import TableContainer from "@material-ui/core/TableContainer";
import { makeStyles } from "@material-ui/core/styles";
import TableBody from "@material-ui/core/TableBody";
import TableHead from "@material-ui/core/TableHead";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Table from "@material-ui/core/Table";
import Paper from "@material-ui/core/Paper";
import { pickleGreen, materialBlack, cardColor } from "../util/constants"

const theme = createMuiTheme({
  typography: {
    fontFamily: "roboto",
  },
  tableCell: {
    backgroundColor: "black",
  }
});

const useStyles = makeStyles((theme) => ({
  earnPaper: {
    borderRadius: "3px",
    backgroundColor: cardColor,
    minHeight: "calc(100% - 32px)",
    boxShadow: `0px 3px ${pickleGreen}`,
  },
  tableHeader: {
    borderBottom: "1px solid gray",
    color: materialBlack,
    fontSize: "1.1rem",
  }
}));

const Header = (props) => {
  const { title, index } = props;
  const classes = useStyles();
  return (
    <>
      {
        index > 0 ?
        <TableCell align="right" className={classes.tableHeader}>
          {title}
        </TableCell> :
        <TableCell className={classes.tableHeader}>
          {title}
        </TableCell>
      }
    </>
  );
};

export default function ThemedTable(props) {
  const { headers, rows } = props;
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <TableContainer component={Paper} className={classes.earnPaper}>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header, i) => <Header title={header} index={i} key={i} />)}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows}
          </TableBody>
        </Table>
      </TableContainer>
    </ThemeProvider>
  );
};