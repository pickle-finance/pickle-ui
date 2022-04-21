import React from "react";
import { StyledButton } from "./style";

export const SwapButtons = ({ children, ...rest }) => {
  return (
    <StyledButton className="disabled:opacity-50 disabled:cursor-not-allowed" {...rest}>
      {" "}
      {children}
    </StyledButton>
  );
};
