import { FC } from "react";
import { ethers } from "ethers";
import { Grid, Link, Input, Tooltip } from "@geist-ui/react";
import { UserJarData } from "../../containers/UserJars";

const formatValue = (num: number) =>
  num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: num < 1 ? 18 : 4,
  });

const formatDollar = (num: number) =>
  num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

interface IProps {
  fromJar: UserJarData | undefined;
  swapAmount: string;
  setSwapAmount: (s: string) => void;
  slippage: number;
  setSlippage: (n: number) => void;
}

export const InputOptions: FC<IProps> = ({
  fromJar,
  swapAmount,
  setSwapAmount,
  slippage,
  setSlippage,
}) => {
  const fromJarBalance = parseFloat(
    ethers.utils.formatEther(fromJar?.deposited || ethers.constants.Zero),
  );

  const setToMax = async () => {
    if (!fromJar) return;
    setSwapAmount(ethers.utils.formatEther(fromJar.deposited));
  };

  return (
    <>
      <Grid xs={24} sm={12}>
        <h2>Amount to Swap</h2>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            lineHeight: "1.625rem",
          }}
        >
          <div>
            Balance: {formatValue(fromJarBalance)} ($
            {formatDollar(fromJarBalance * (fromJar?.usdPerPToken || 0))})
          </div>
          <Link color href="javascript:;" onClick={setToMax}>
            Max
          </Link>
        </div>
        <Input
          onChange={(e) => setSwapAmount(e.target.value)}
          value={swapAmount}
          width="100%"
          type="number"
          size="large"
        />
      </Grid>
      <Grid xs={24} sm={12}>
        <h2>Allowable Slippage %</h2>
        <div style={{ lineHeight: "1.625rem", textAlign: "right" }}>
          <Tooltip text="The maximum percentage slippage allowed during the swap. The transaction will revert if this is too low.">
            <div style={{ cursor: "help", color: "#53ffe2" }}>
              What is this?
            </div>
          </Tooltip>
        </div>
        <Input
          onChange={(e) => setSlippage(parseFloat(e.target.value))}
          value={slippage.toString()}
          type="number"
          width="100%"
          size="large"
          min="0"
        />
      </Grid>
    </>
  );
};
