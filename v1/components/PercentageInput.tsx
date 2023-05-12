import { Input } from "@geist-ui/react";
import React, { ReactElement } from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";

export const PercentageInput = (props: NumericFormatProps): ReactElement => {
  return (
    <NumericFormat
      {...props}
      customInput={Input}
      suffix="%"
      isAllowed={({ floatValue }) => !floatValue || (floatValue >= 0 && floatValue <= 100)}
      decimalScale={2}
    />
  );
};
