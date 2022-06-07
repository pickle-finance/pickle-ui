import { FC } from "react";
import { ethers, BigNumber } from "ethers";
import GaugeChart from "react-gauge-chart";
import styled from "styled-components";
import Skeleton from "@material-ui/lab/Skeleton";
import { Trans, useTranslation } from "next-i18next";

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
  const { t } = useTranslation("common");

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
        <Trans i18nKey="dill.averageLockDuration">
          The average lock duration is currently
          <span style={{ color: accentColor }}>{{ years }}</span> years (based on{" "}
          {{ dill: formatNumber(dillSupply) }} DILL and
          {{ pickle: formatNumber(pickleLocked) }} PICKLEs locked).
        </Trans>
      </div>
    </>
  );
};
