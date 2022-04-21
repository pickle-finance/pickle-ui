import React from "react";
import SwapVertIcon from "@material-ui/icons/SwapVert";

export const FlipTokens = ({ onClick }: { onClick: () => void }) => {
  return <SwapVertIcon onClick={onClick} fontSize="medium" />;
};
