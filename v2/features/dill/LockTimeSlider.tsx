import { FC, useState } from "react";
import { IUserDillStats } from "picklefinance-core/lib/client/UserModel";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

import { getDayOffset, getWeekDiff } from "./flows/utils";
import { dateFromEpoch } from "v1/util/date";

interface Props {
  setLockTime: (date: Date) => void;
  dill?: IUserDillStats | undefined;
  lockTime: Date;
}

const LockTimeSlider: FC<Props> = ({ setLockTime, dill }) => {
  if (!dill?.lockEnd) return <></>;

  const currentLockEnd = parseFloat(dill?.lockEnd)
    ? dateFromEpoch(parseFloat(dill?.lockEnd))
    : new Date();
  const max = getWeekDiff(currentLockEnd, getDayOffset(new Date(), 365 * 4 - 7));
  const [weeks, setWeeks] = useState<number>(max);

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
      handleStyle={{
        backgroundColor: "rgb(var(--color-accent))",
        borderColor: "rgb(var(--color-accent))",
        boxShadow: "none",
        opacity: 1,
      }}
      trackStyle={{
        backgroundColor: "rgb(var(--color-accent))",
        borderColor: "rgb(var(--color-accent))",
      }}
      railStyle={{
        backgroundColor: "rgb(var(--color-foreground-alt-400))",
      }}
    />
  );
};

export default LockTimeSlider;
