import { FC } from "react";
import { ethers, BigNumber } from "ethers";
import GaugeChart from "react-gauge-chart";
import styled from "styled-components";
import Skeleton from "@material-ui/lab/Skeleton";

import { UseDillOutput } from "../../../containers/Dill";
import { accentColor } from "../../../util/constants";

interface Props {
  dillStats: UseDillOutput;
}

const ChartContainer = styled.div`
  margin-top: 18px;

  text {
    font-size: 24px !important;
  }
`;

const formatNumber = (number: BigNumber) =>
  Math.round(parseFloat(ethers.utils.formatEther(number))).toLocaleString();

export const LockDurationChart: FC<Props> = ({ dillStats }) => {
  const { totalSupply: dillSupply, totalLocked: pickleLocked } = dillStats;

  if (!dillSupply || !pickleLocked) {
    return (
      <Skeleton
        variant="rect"
        animation="wave"
        width="100%"
        height="250px"
        style={{
          backgroundColor: "#FFF",
          opacity: 0.1,
        }}
      />
    );
  }

  const ratio =
    parseFloat(ethers.utils.formatEther(dillSupply)) /
    parseFloat(ethers.utils.formatEther(pickleLocked));
  const years = Math.round(ratio * 4 * 100) / 100;

  return (
    <>
      <ChartContainer>
        <GaugeChart
          id="lock-duration-gauge-chart"
          nrOfLevels={4}
          colors={["#FFF", accentColor]}
          arcWidth={0.2}
          needleColor={accentColor}
          needleBaseColor={accentColor}
          percent={ratio}
          formatTextValue={() => `${years} years`}
        />
      </ChartContainer>

      <div>
        The average lock duration is currently{" "}
        <span style={{ color: accentColor }}>{years}</span> years (based on{" "}
        {formatNumber(dillSupply)} DILL and {formatNumber(pickleLocked)} PICKLEs
        locked).
      </div>
    </>
  );
};
