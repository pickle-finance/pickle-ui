import { materialBlack, pickleGreen, cardColor } from "../util/constants";
import React, { useState, useEffect, useRef } from "react";
import { LineChart, Line, YAxis, XAxis, Legend } from "recharts";
import { makeStyles } from "@material-ui/core/styles";
import { getTickValues } from "recharts-scale";
import Skeleton from "@material-ui/lab/Skeleton";
import Paper from "@material-ui/core/Paper";
import dayjs from "v1/util/dayjs";
import { useTranslation } from "next-i18next";

const useStyles = makeStyles((theme) => ({
  picklePaper: {
    border: `1px solid ${pickleGreen}`,
    borderRadius: "3px",
    backgroundColor: cardColor,
    color: materialBlack,
    [theme.breakpoints.up("xs")]: {
      height: "400px",
    },
    [theme.breakpoints.up("md")]: {
      height: "calc(100vh - 240px)",
    },
    overflow: "auto",
  },
  tagline: {
    color: materialBlack,
  },
}));

const colors = {
  sCRV: "#81f5ff",
  "3poolCRV": "#00FA9A",
  renBTCCRV: "#f2a900",
  "SLP-DAI": "#FF69B4",
  "SLP-USDC": "#8A2BE2",
  "SLP-USDT": "#00FFFF",
  "SLP-WBTC": "#d8345f",
  "SLP-YFI": "#FFFF00",
  "MIC-USDT": "#87bc4e",
  "BAC-DAI": "#7262eb",
};

const formatDate = (tick) => {
  let formattedDate = dayjs(tick).format("l");
  return formattedDate.slice(0, formattedDate.lastIndexOf("/"));
};

export default function JarPerformanceChart(props) {
  const classes = useStyles();
  const { t } = useTranslation("common");

  const targetRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const handleResize = () => {
    if (targetRef.current) {
      setDimensions({
        width: targetRef.current.clientWidth,
        height: targetRef.current.clientHeight,
      });
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

  const [chartData, setChartData] = useState({ data: [], lines: [], max: 1 });
  useEffect(() => {
    if (props.data.length === 0) {
      return;
    }

    const assets = props.data.map((d) => d.asset);
    const blockData = {};
    props.data.forEach((item) => {
      item.data.forEach((d) => {
        if (blockData[d.x] === undefined) {
          blockData[d.x] = { x: d.x };
        }
        blockData[d.x][item.asset] = d.y;
      });
    });

    let max = 1;
    const prevValues = {};
    const combinedData = [];
    for (const key of Object.keys(blockData).sort()) {
      const point = { x: parseInt(key) };
      const value = blockData[key];
      for (const asset of assets) {
        if (value[asset]) {
          prevValues[asset] = value[asset];
          point[asset] = value[asset];
        } else {
          point[asset] = prevValues[asset];
        }
        if (point[asset] > max) {
          max = point[asset];
        }
      }
      combinedData.push(point);
    }

    const trimmedData = [];
    for (let i = 0; i < combinedData.length; i++) {
      if (i % 50 === 0) {
        trimmedData.push(combinedData[i]);
      }
    }

    const lines = props.data.map((d) => ({
      asset: d.asset,
      stroke: colors[d.asset],
    }));

    setChartData({ data: trimmedData, lines: lines, max: max });
  }, [props.data]);

  const yTicks = getTickValues([1, chartData.max]);
  return (
    <>
      <Paper className={classes.picklePaper} ref={targetRef}>
        {chartData.data.length > 0 ? (
          <>
            <LineChart
              width={dimensions.width}
              height={dimensions.height}
              data={chartData.data}
              margin={{ top: 15, right: 20, left: 0, bottom: 10 }}
            >
              <YAxis
                domain={[1, "dataMax"]}
                label={{
                  value: t("balances.ratio"),
                  angle: -90,
                  position: "insideLeft",
                  offset: 15,
                  fill: materialBlack,
                }}
                tick={{ fill: materialBlack }}
                ticks={yTicks}
              />
              <XAxis dataKey="x" tickFormatter={formatDate} tick={{ fill: materialBlack }} />
              <Legend />
              {chartData.lines.map((d) => (
                <Line
                  type="monotone"
                  dataKey={d.asset}
                  stroke={d.stroke}
                  dot={false}
                  key={d.asset}
                />
              ))}
            </LineChart>
          </>
        ) : (
          <Skeleton
            variant="rect"
            animation="wave"
            width={dimensions.width}
            height={dimensions.height}
          />
        )}
      </Paper>
    </>
  );
}
