import { useState, FC, useEffect } from "react";
import { Spacer, Grid, Card, Button } from "@geist-ui/react";
import styled from "styled-components";
import { formatEther } from "ethers/lib/utils";
import { Contracts } from "../../containers/Contracts";
import { Connection } from "../../containers/Connection";
import { Dill, UseDillOutput } from "../../containers/Dill";
import {
  ERC20Transfer,
  Status as ERC20TransferStatus,
} from "../../containers/Erc20Transfer";

interface ButtonStatus {
  disabled: boolean;
  text: string;
}

const setButtonStatus = (
  status: ERC20TransferStatus,
  transfering: string,
  idle: string,
  setButtonText: (arg0: ButtonStatus) => void,
) => {
  if (status === ERC20TransferStatus.Transfering) {
    setButtonText({
      disabled: true,
      text: transfering,
    });
  }

  if (
    status === ERC20TransferStatus.Success ||
    status === ERC20TransferStatus.Failed ||
    status === ERC20TransferStatus.Cancelled
  ) {
    setButtonText({
      disabled: false,
      text: idle,
    });
  }
};

const formatNumber = (num: number, precision?: number) =>
  num &&
  (num.toLocaleString(undefined, {
    minimumFractionDigits: precision || 2,
    maximumFractionDigits: precision || 2,
  }) ||
    0);

const formatPercent = (decimal: number) =>
  decimal &&
  (decimal * 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + "%";

export const Claim: FC<{
  dillStats: UseDillOutput;
}> = ({ dillStats }) => {
  const { blockNum, address, signer } = Connection.useContainer();
  const { feeDistributor } = Contracts.useContainer();
  const [claimable, setClaimable] = useState<number | null>(null);

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
      ? dillStats.weeklyDistribution / dillStats.lockedValue * 52
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
            <div>Weekly protocol revenue: ${formatNumber(dillStats?.weeklyProfit)}</div>
            &nbsp;
            <div>
              Weekly distribution (45% of revenue): $
              {formatNumber(dillStats?.weeklyDistribution)}
            </div>
            &nbsp;
            <div>DILL holder APY: {formatPercent(dillAPY)}</div>
            &nbsp;
            <div>
              Next distribution: Thu May 6 2021
            </div>
            {/* <div>
              Next distribution: {dillStats.nextDistribution?.toDateString()}
            </div> */}
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
