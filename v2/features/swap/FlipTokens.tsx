import React from "react";
import SwapVertIcon from "@mui/icons-material/SwapVert";

export const FlipTokens = ({ onClick }: { onClick: () => void }) => {
  return <SwapVertIcon cursor="pointer" onClick={onClick} fontSize="medium" />;
};
