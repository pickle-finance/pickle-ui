import { Select } from "@geist-ui/react";
import DayPickerInput from "react-day-picker/DayPickerInput";
import styled from "styled-components";

interface SelectPeriodProps {
  className?: string;
  onChange: (weeks: number) => void;
}

const SelectPeriod = ({ className, onChange }: SelectPeriodProps) => {
  const onChangeYear = () => {};
  const onChangeMonth = () => {};
  const onChangeWeek = () => {};

  return (
    <div className={className}>
      <Select
        placeholder=""
        onChange={onChangeYear}
        css={{ minWidth: "60px !important" }}
        width="60px"
      >
        {[...Array(10)].map((x, i) => (
          <Select.Option key={i} value={`${i + 1}`}>
            {i + 1}
          </Select.Option>
        ))}
      </Select>
      Years
      <Select
        placeholder=""
        onChange={onChangeYear}
        css={{ minWidth: "60px !important" }}
        width="60px"
      >
        {[...Array(10)].map((x, i) => (
          <Select.Option key={i} value={`${i + 1}`}>
            {i + 1}
          </Select.Option>
        ))}
      </Select>
      Months
      <Select
        placeholder=""
        onChange={onChangeYear}
        css={{ minWidth: "60px !important" }}
        width="60px"
      >
        {[...Array(10)].map((x, i) => (
          <Select.Option key={i} value={`${i + 1}`}>
            {i + 1}
          </Select.Option>
        ))}
      </Select>
      Weeks
    </div>
  );
};

const StyledSelectPeriod = styled(SelectPeriod)({});

export { StyledSelectPeriod as SelectPeriod };
