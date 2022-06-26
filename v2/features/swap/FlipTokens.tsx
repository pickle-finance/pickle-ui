import React from "react";
import SwapVertIcon from "@material-ui/icons/SwapVert";

export const FlipTokens = ({ onClick }: { onClick: () => void }) => {
  return <SwapVertIcon cursor="pointer" onClick={onClick} fontSize="medium" />;
};
