import React, { VFC } from "react";
import { useWindowSize } from "rooks";
import ReactConfetti from "react-confetti";

import { useAppDispatch, useAppSelector } from "v2/store";
import { ThemeSelectors, ThemeActions } from "v2/store/theme";

const Confetti: VFC = () => {
  const dispatch = useAppDispatch();
  const { innerWidth: width, innerHeight: height } = useWindowSize();
  const isConfettiOn = useAppSelector(ThemeSelectors.selectIsConfettiOn);

  if (!isConfettiOn || !width || !height) return null;

  return (
    <ReactConfetti
      width={width}
      height={height}
      recycle={false}
      numberOfPieces={500}
      gravity={0.15}
      onConfettiComplete={() => dispatch(ThemeActions.setIsConfettiOn(false))}
      style={{ zIndex: 300 }}
    />
  );
};

export default Confetti;
