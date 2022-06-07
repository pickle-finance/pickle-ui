import React, { useRef, useState, useEffect } from "react";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import {
  materialBlack,
  pickleGreen,
  cardColor,
  pickleNeon,
  graphFill,
  pickleWhite,
} from "../util/constants";
import Avatar from "@material-ui/core/Avatar";
import Skeleton from "@material-ui/lab/Skeleton";
import { AreaChart, Area, YAxis, XAxis, Tooltip } from "recharts";
import dayjs from "v1/util/dayjs";
import { useTranslation } from "next-i18next";

const useStyles = makeStyles((theme) => ({
  picklePaper: {
    border: `1px solid ${pickleGreen}`,
    borderRadius: "3px",
    backgroundColor: cardColor,
    color: materialBlack,
    height: "300px",
  },
  chartHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    height: "40px",
    color: pickleWhite,
    marginBottom: theme.spacing(0.8),
  },
  chartTextSkeleton: {
    opacity: 0.3,
    borderRadius: "3px",
    backgroundColor: pickleNeon,
  },
  chartHeaderSkeleton: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    height: "35px",
    marginBottom: "7px",
  },
  chartAvatarSkeleton: {
    height: "30px",
    width: "30px",
    opacity: 0.3,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    backgroundColor: pickleNeon,
  },
  avatar: {
    height: "25px",
    width: "25px",
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  tagline: {
    color: pickleNeon,
    textShadow: `${pickleGreen} 0 0 18px`,
  },
}));

const formatValue = (value) => new Intl.NumberFormat("en").format(value.toFixed(2));
const formatLabel = (label) => dayjs(label).format("lll");
const formatY = (value) => {
  if (value > 1000000) {
    return `${(value / 1000000).toFixed(0)}M`;
  } else if (value > 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toFixed(0);
};

const formatDollars = (num) =>
  "$" +
  num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function JarValueChart(props) {
  const classes = useStyles();
  const { t } = useTranslation("common");

  const { data, asset, name, formatter } = props.jar;
  const formatTooltip = (value) => {
    return [`${formatValue(value)}`, formatter ? formatter : t("balances.tvl")];
  };
  const formatDate = (tick) => {
    let formattedDate = dayjs(tick).format("l");
    return formattedDate.slice(0, formattedDate.lastIndexOf("/"));
  };

  const targetRef = useRef();
  const [width, setWidth] = useState(0);
  const handleResize = () => {
    if (targetRef.current) {
      setWidth(targetRef.current.clientWidth);
    }
  };
  useEffect(() => {
    handleResize();
  }, []);
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return (_) => {
      window.removeEventListener("resize", handleResize);
    };
  });

  let value;
  if (data.length > 0) {
    const currentValue = data[data.length - 1].y;
    value = formatDollars(currentValue);
  }

  const icon = `/assets/${asset.toLowerCase()}.png`;
  const tooltipFormat = {
    backgroundColor: cardColor,
    border: `1px solid ${pickleGreen}`,
    borderRadius: "3px",
    color: materialBlack,
  };
  return (
    <>
      {data.length > 0 ? (
        <>
          <div className={classes.chartHeader}>
            <Avatar variant="square" alt={asset} src={icon} className={classes.avatar} />
            <Typography variant="h6" className={classes.chartHeader}>
              {name ? name : asset}: {value}
            </Typography>
          </div>
        </>
      ) : (
        <>
          <div className={classes.chartHeaderSkeleton}>
            <Skeleton variant="circle" animation="wave" className={classes.chartAvatarSkeleton} />
            <Skeleton
              variant="rect"
              animation="wave"
              width={width * 0.6}
              className={classes.chartTextSkeleton}
            />
          </div>
        </>
      )}
      <Paper className={classes.picklePaper} ref={targetRef}>
        {data.length > 0 ? (
          <>
            <AreaChart
              width={width}
              height={300}
              data={data}
              margin={{ top: 15, right: 10, left: 0, bottom: 0 }}
            >
              <Area type="monotone" dataKey="y" stroke={pickleNeon} fill={graphFill} />
              <YAxis tickFormatter={formatY} domain={[0, "auto"]} tick={{ fill: materialBlack }} />
              <XAxis
                dataKey="x"
                domain={["dataMin", "dataMax"]}
                name="Time"
                tickFormatter={formatDate}
                type="number"
                tick={{ fill: materialBlack }}
                padding={{ left: 10, right: 10 }}
              />
              <Tooltip
                contentStyle={tooltipFormat}
                formatter={formatTooltip}
                labelFormatter={formatLabel}
                separator={": "}
              />
            </AreaChart>
          </>
        ) : (
          <Skeleton variant="rect" animation="wave" width={width} height={300} />
        )}
      </Paper>
    </>
  );
}
