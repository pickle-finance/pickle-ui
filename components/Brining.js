import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { pickleGreen } from "../util/constants";

const useStyles = makeStyles(() => ({
  brining: {
    minHeight: "100%",
    margin: "auto",
    color: pickleGreen,
    textShadow: `${pickleGreen} 0 0 18px`,
  },
}));

export default function Brining() {
  const classes = useStyles();

  return (
    <>
      <Typography variant="h2" className={classes.brining}>
        Brining...
      </Typography>
    </>
  );
}
