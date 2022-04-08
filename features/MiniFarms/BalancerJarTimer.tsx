import React, { FC, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useTranslation } from "next-i18next";

export interface BalancerJarTimerProps {
  endTime: number;
  timeLockLength: number;
  initialExitFee: number;
  initialExitFeeMax: number;
}
export const BalancerJarTimer: FC<BalancerJarTimerProps> = ({
  endTime,
  timeLockLength,
  initialExitFee,
  initialExitFeeMax,
}) => {
  const Ref = useRef<number | null>(null);

  const [timer, setTimer] = useState<string | null>(null);

  const { t } = useTranslation("common");

  const getWithdrawalFee = () => {
    const currentTime = Date.parse(Date()) / 1000;
    const timeDiff = endTime - currentTime;
    const exitFeePercentage =
      ((initialExitFee * timeDiff) / timeLockLength / initialExitFeeMax) * 100;
    return exitFeePercentage > 0 ? exitFeePercentage : 0;
  };

  const getTimeRemaining = (cooldownEndTime: number) => {
    const currentTime = Date.parse(Date()) / 1000;
    const total = cooldownEndTime - currentTime;
    const seconds = Math.floor(total % 60);
    const minutes = Math.floor(total / 60) % 60;
    const hours = Math.floor(total / 60 / 60) % 24;
    const days = Math.floor(total / 60 / 60 / 24);
    return {
      total,
      days,
      hours,
      minutes,
      seconds,
    };
  };

  const startTimer = (cooldownEndTime: number) => {
    let { total, days, hours, minutes, seconds } = getTimeRemaining(cooldownEndTime);
    if (total >= 0) {
      // update the timer
      // check if less than 10 then we need to
      // add '0' at the begining of the variable
      setTimer(
        days +
          "D:" +
          (hours > 9 ? hours : "0" + hours) +
          "H:" +
          (minutes > 9 ? minutes : "0" + minutes) +
          "M:" +
          (seconds > 9 ? seconds : "0" + seconds) +
          "S",
      );
    }
  };

  const clearTimer = (e: number) => {
    setTimer("00:00:00"); // This shows when the cooldown ends or when user is not staked in the jar.

    if (Ref.current) clearInterval(Ref.current); // There should only be one interval per mounted component
    const id = setInterval(() => {
      startTimer(e);
    }, 1000);
    Ref.current = id;
  };

  useEffect(() => {
    clearTimer(endTime);
    getWithdrawalFee();
  }, []);

  return (
    <StyledNotice>
      <h2>{t("farms.balancer.cooldown") + `: (${timer})`}</h2>
      <h2>{t("farms.balancer.exit") + `: ${getWithdrawalFee().toFixed(2)}%`}</h2>
    </StyledNotice>
  );
};

const StyledNotice = styled.div`
  width: "100%";
  textalign: "center";
  paddingtop: "6px";
  fontfamily: "Source Sans Pro";
`;
