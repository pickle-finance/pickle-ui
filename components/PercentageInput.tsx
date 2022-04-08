import { Input } from "@geist-ui/react";
import React, { ReactElement } from "react";
import NumberFormat, { NumberFormatProps } from "react-number-format";

export const PercentageInput = (props: NumberFormatProps): ReactElement => {
  return (
    <NumberFormat
      {...props}
      customInput={Input}
      suffix="%"
      isAllowed={({ floatValue }) => !floatValue || (floatValue >= 0 && floatValue <= 100)}
      decimalScale={2}
    />
  );
};
