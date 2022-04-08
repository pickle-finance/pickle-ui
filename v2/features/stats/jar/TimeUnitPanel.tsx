import React, { FC } from "react";

const TimeUnitPanel: FC<{ timeChange: timeChangeFunction }> = ({ timeChange }) => {
  return (
    <span style={{ marginLeft: "80%" }}>
      <TimeButton timeUnit="hr" displaytext="1h" timeChange={timeChange} />
      <TimeButton timeUnit="hr6" displaytext="6h" timeChange={timeChange} />
      <TimeButton timeUnit="day" displaytext="d" timeChange={timeChange} />
      <TimeButton timeUnit="wk" displaytext="w" timeChange={timeChange} />
    </span>
  );
};

const TimeButton: FC<{
  timeUnit: string;
  displaytext: string;
  timeChange: timeChangeFunction;
}> = ({ timeUnit, displaytext, timeChange }) => (
  <button onClick={() => timeChange(timeUnit)} className="text-primary-light ml-5">
    {displaytext}
  </button>
);

type timeChangeFunction = (timeUnit: string) => void;

export default TimeUnitPanel;
