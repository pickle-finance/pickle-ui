import { useState, FC, useEffect } from "react";
import { Spacer, Grid, Card, Button } from "@geist-ui/react";
import { formatEther } from "ethers/lib/utils";
import { Contracts } from "../../containers/Contracts";
import { Connection } from "../../containers/Connection";
import { UseDillOutput } from "../../containers/Dill";
import { ERC20Transfer } from "../../containers/Erc20Transfer";
import { formatPercent } from "../../util/number";
import PickleIcon from "../../components/PickleIcon";
import { useButtonStatus, ButtonStatus } from "hooks/useButtonStatus";

const formatNumber = (num: number, precision?: number) =>
  num &&
  (num.toLocaleString(undefined, {
    minimumFractionDigits: precision || 2,
    maximumFractionDigits: precision || 2,
  }) ||
    0);

export const Claim: FC<{
  dillStats: UseDillOutput;
}> = ({ dillStats }) => {
  const { blockNum, address, signer } = Connection.useContainer();
  const { feeDistributor } = Contracts.useContainer();
  const [claimable, setClaimable] = useState<number | null>(null);
  const { setButtonStatus } = useButtonStatus();

  const [claimButton, setClaimButton] = useState<ButtonStatus>({
    disabled: claimable ? false : true,
    text: `Claim ${claimable ? formatNumber(claimable, 3) : "0"} PICKLEs`,
  });
  const {
    status: transferStatus,
    transfer,
    getTransferStatus,
  } = ERC20Transfer.useContainer();

  const dillAPY =
    dillStats.weeklyDistribution && dillStats.lockedValue
      ? (dillStats.weeklyDistribution / dillStats.lockedValue) * 52
      : 0;

  useEffect(() => {
    if (address && feeDistributor) {
      const claimStatus = getTransferStatus("claim", feeDistributor.address);
      const claimable = dillStats.userClaimable
        ? parseFloat(formatEther(dillStats.userClaimable))
        : null;

      if (claimable) {
        setClaimButton({
          disabled: false,
          text: `Claim ${formatNumber(claimable, 3)} PICKLEs`,
        });
        setButtonStatus(
          claimStatus,
          "Claiming...",
          `Claim ${formatNumber(claimable, 3)} PICKLEs`,
          setClaimButton,
        );
      } else {
        setClaimButton({
          disabled: true,
          text: "Claim 0 PICKLEs",
        });
      }
      setClaimable(claimable);
    }
  }, [blockNum, transferStatus, address, dillStats]);
  return (
    <>
      <Grid.Container gap={2}>
        <Grid xs={24} sm={24} md={24}>
          <Card>
            <h2>Claim</h2>
            <div>
              Weekly protocol revenue: ${formatNumber(dillStats?.weeklyProfit)}
            </div>
            &nbsp;
            <div>
              Projected weekly distribution (45% of revenue): $
              {formatNumber(dillStats?.weeklyDistribution)}
            </div>
            &nbsp;
            <div>DILL holder APY: {formatPercent(dillAPY)}</div>
            &nbsp;
            <div>
              Next distribution: {dillStats.nextDistribution?.toDateString()}
            </div>
            &nbsp;
            <div>
              Last week's distribution: $
              {formatNumber(dillStats?.lastDistributionValue)} (
              {formatNumber(dillStats?.lastDistribution)}{" "}
              <PickleIcon size={16} />)
            </div>
            &nbsp;
            <Spacer />
            <Button
              disabled={claimButton.disabled}
              onClick={() => {
                if (signer && address && feeDistributor) {
                  transfer({
                    token: "claim",
                    recipient: feeDistributor.address,
                    transferCallback: async () => {
                      const tx = await feeDistributor
                        .connect(signer)
                        ["claim()"]();
                      tx.wait(0).then(() =>
                        setClaimButton({
                          disabled: true,
                          text: "Claim 0 PICKLEs",
                        }),
                      );
                      return tx;
                    },
                    approval: false,
                  });
                }
              }}
              style={{ width: "100%" }}
            >
              {claimButton.text}
            </Button>
          </Card>
        </Grid>
      </Grid.Container>
    </>
  );
};
