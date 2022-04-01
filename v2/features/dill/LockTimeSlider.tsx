import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import { IUserDillStats } from "picklefinance-core/lib/client/UserModel";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

import { getDayOffset, getWeekDiff } from "./flows/utils";
import { dateFromEpoch } from "util/date";

interface Props {
  setLockTime: (date: Date) => void;
  dill?: IUserDillStats | undefined;
  lockTime: Date;
}

const LockTimeSlider: FC<Props> = ({ lockTime, setLockTime, dill }) => {
  if (!dill?.lockEnd) return <></>;

  const [weeks, setWeeks] = useState<number>(0);
  const currentLockEnd = parseFloat(dill?.lockEnd) ? dateFromEpoch(parseFloat(dill?.lockEnd)) : new Date();
  const max = getWeekDiff(currentLockEnd, getDayOffset(new Date(), 365 * 4));

  const onSliderChange = (value: number | number[]) => {
    setWeeks(value as number);
    setLockTime(getDayOffset(currentLockEnd, (value as number) * 7));
  };

  return (
    <Slider
      style={{ width: "auto" }}
      className="m-5"
      max={max}
      value={weeks}
      onChange={onSliderChange}
    />
  );
};

export default LockTimeSlider;
