import React from "react";
import { createMuiTheme, ThemeProvider } from "@mui/material/styles";
import TableContainer from "@mui/material/TableContainer";
import { makeStyles } from "@mui/material/styles";
import TableBody from "@mui/material/TableBody";
import TableHead from "@mui/material/TableHead";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Table from "@mui/material/Table";
import Paper from "@mui/material/Paper";
import { pickleGreen, materialBlack, cardColor } from "../util/constants";

const theme = createMuiTheme({
  tableCell: {
    backgroundColor: "black",
  },
});

const useStyles = makeStyles((theme) => ({
  earnPaper: {
    borderRadius: "3px",
    backgroundColor: "#0e1d15",
    minHeight: "calc(100% - 32px)",
    border: `1px solid ${pickleGreen}`,
  },
  tableHeader: {
    borderBottom: "1px solid gray",
    color: materialBlack,
    fontSize: "1.1rem",
  },
}));

const Header = (props) => {
  const { title, index } = props;
  const classes = useStyles();
  return (
    <>
      {index > 0 ? (
        <TableCell align="right" className={classes.tableHeader}>
          {title}
        </TableCell>
      ) : (
        <TableCell className={classes.tableHeader}>{title}</TableCell>
      )}
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
              {headers?.map((header, i) => (
                <Header title={header} index={i} key={i} />
              ))}
            </TableRow>
          </TableHead>
          <TableBody>{rows}</TableBody>
        </Table>
      </TableContainer>
    </ThemeProvider>
  );
}
