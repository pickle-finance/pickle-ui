import { FC, useState } from "react";
import { useTranslation, Trans } from "next-i18next";
import { useIntervalWhen } from "rooks";

const second = 1;
const minute = 60;
const hour = minute * 60;
const day = hour * 24;
const week = day * 7;
const month = day * 30;
const year = day * 365;

interface Props {
  date: number;
}

const TimeAgo: FC<Props> = ({ date }) => {
  const { t } = useTranslation("common");

  // A simple helper state value to trigger component rerender.
  const [nonce, setNonce] = useState<number>(0);
  useIntervalWhen(() => setNonce(nonce + 1), 1000, !!date);

  const title = new Date(date).toString();
  const secondsAgo = Math.round((+new Date() - date) / 1000);
  let divisor: number;
  let unit: string;

  if (secondsAgo < 5) {
    return <span title={title}>{t("v2.time.moment")}</span>;
  } else if (secondsAgo < minute) {
    [divisor, unit] = [second, "second"];
  } else if (secondsAgo < hour) {
    [divisor, unit] = [minute, "minute"];
  } else if (secondsAgo < day) {
    [divisor, unit] = [hour, "hour"];
  } else if (secondsAgo < week) {
    [divisor, unit] = [day, "day"];
  } else if (secondsAgo < month) {
    [divisor, unit] = [week, "week"];
  } else if (secondsAgo < year) {
    [divisor, unit] = [month, "month"];
  } else {
    [divisor, unit] = [year, "year"];
  }

  const count = Math.floor(secondsAgo / divisor);

  return (
    <span title={title} key={nonce}>
      <Trans i18nKey={`v2.time.${unit}`} count={count}>
        time ago
      </Trans>
    </span>
  );
};

export default TimeAgo;
