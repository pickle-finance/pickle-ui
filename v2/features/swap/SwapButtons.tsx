import React, { FC, PropsWithChildren } from "react";
import { StyledButton } from "./style";

export const SwapButtons: FC<PropsWithChildren> = ({ children, ...rest }) => {
  return (
    <StyledButton className="disabled:opacity-50 disabled:cursor-not-allowed" {...rest}>
      {children}
    </StyledButton>
  );
};
