import { Card } from "@geist-ui/react";
import { ethers } from "ethers";
import { FC } from "react";
import { UserJarData } from "../../containers/UserJars";
const { parseEther, formatEther } = ethers.utils;

const formatValue = (num: number) =>
  num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: num < 1 ? 8 : 4,
  });

const formatDollar = (num: number) =>
  num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

interface IProps {
  swapAmount: string;
  fromJar: UserJarData | undefined;
  toJar: UserJarData | undefined;
  needsApproval: boolean;
  querying: boolean;
  estimatedReturns: ethers.BigNumber | null;
}

export const PreviewFooter: FC<IProps> = ({
  swapAmount,
  fromJar,
  toJar,
  needsApproval,
  querying,
  estimatedReturns,
}) => {
  const exceedsBalance = !fromJar?.deposited
    ? false
    : fromJar.deposited.lt(parseEther(swapAmount === "" ? "0" : swapAmount));

  return (
    <>
      <Card.Footer>
        In: {swapAmount === "" ? "0" : formatValue(Number(swapAmount))}{" "}
        {fromJar?.name} (~$
        {formatDollar(
          parseFloat(swapAmount === "" ? "0" : swapAmount) *
            (fromJar?.usdPerPToken || 0),
        )}
        )&nbsp;&nbsp;
        {exceedsBalance && (
          <span style={{ color: "red" }}>Insufficient input balance</span>
        )}
      </Card.Footer>

      <Card.Footer>
        Out (estimated): {needsApproval && "Approve to estimate output"}
        {!needsApproval &&
          !querying &&
          formatValue(
            Number(formatEther(estimatedReturns || ethers.constants.Zero)),
          )}
        {!needsApproval && querying && "..."} {!needsApproval && toJar?.name}{" "}
        (~$
        {!needsApproval &&
          !querying &&
          formatDollar(
            parseFloat(formatEther(estimatedReturns || ethers.constants.Zero)) *
              (toJar?.usdPerPToken || 0),
          )}
        )
      </Card.Footer>
    </>
  );
};
