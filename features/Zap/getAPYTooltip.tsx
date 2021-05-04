import { Tooltip } from "@geist-ui/react";
import { JarApy } from "../../containers/Jars-Ethereum/useCurveCrvAPY";

const getTooltipText = (APYs: JarApy[]) =>
  APYs.map((x) => {
    const k = Object.keys(x)[0];
    const v = Object.values(x)[0];
    return `${k}: ${v.toFixed(2)}%`;
  }).join(" + ");

const getTotalAPY = (APYs: JarApy[]) =>
  APYs.map((x) => Object.values(x).reduce((a, b) => a + b, 0)).reduce(
    (a, b) => a + b,
    0,
  );

export const getAPYTooltip = (APYs: JarApy[] | null) => {
  if (!APYs) return "--";
  return (
    <Tooltip text={getTooltipText(APYs)}>
      {getTotalAPY(APYs).toFixed(2)}%
    </Tooltip>
  );
};
