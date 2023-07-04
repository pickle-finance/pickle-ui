import React from "react";
import { createTheme, ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import TableContainer from "@mui/material/TableContainer";
import { styled } from '@mui/material/styles';
import TableBody from "@mui/material/TableBody";
import TableHead from "@mui/material/TableHead";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Table from "@mui/material/Table";
import Paper from "@mui/material/Paper";
import { pickleGreen, materialBlack } from "../util/constants";

const theme = createTheme();

const PREFIX = "V1ComponentsThemedTable";
const classes = {
  tableCell: `${PREFIX}-tableCell`,
  earnPaper: `${PREFIX}-earnPaper`,
  tableHeader: `${PREFIX}-tableHeader`,
}

const CustomTableCell = styled(TableCell)(() => ({
  backgroundColor: "black",
  borderBottom: "1px solid gray",
  color: materialBlack,
  fontSize: "1.1rem",

}))

const CustomDiv = styled('div')(() => ({
  [`& .${classes.earnPaper}`]: {
    borderRadius: "3px",
    backgroundColor: "#0e1d15",
    minHeight: "calc(100% - 32px)",
    border: `1px solid ${pickleGreen}`,
  }
}))

const Header = (props: any) => {
  const { title, index } = props;
  return (
    <>
      {index > 0 ? (
        <CustomTableCell align="right">
          {title}
        </CustomTableCell>
      ) : (
        <CustomTableCell>{title}</CustomTableCell>
      )}
    </>
  );
};

export default function ThemedTable(props: any) {
  const { headers, rows } = props;

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CustomDiv>
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
        </CustomDiv>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
