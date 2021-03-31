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

const formatNumber = (num: number) =>
  num &&
  (num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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
  const { feeShare } = Contracts.useContainer();
  const [claimable, setClaimable] = useState<number | null>(null);
  
  const [claimButton, setClaimButton] = useState<ButtonStatus>({
    disabled: claimable ? false : true,
    text: `Claim ${claimable ? formatNumber(claimable) : "0"} PICKLEs`,
  });
  const {
    status: transferStatus,
    transfer,
    getTransferStatus,
  } = ERC20Transfer.useContainer();

  const dillAPY =
    dillStats.weeklyDistribution && dillStats.lockedValue
      ? dillStats.weeklyDistribution / dillStats.lockedValue
      : 0;

  useEffect(() => {
    if (address && feeShare) {
      const claimStatus = getTransferStatus("claim", feeShare.address);
      const claimable = dillStats.userClaimable
        ? parseFloat(formatEther(dillStats.userClaimable))
        : null;

      if (claimable) {
        setClaimButton({
          disabled: false,
          text: `Claim ${formatNumber(claimable)} PICKLEs`,
        });
        setButtonStatus(
          claimStatus,
          "Claiming...",
          `Claim ${formatNumber(claimable)} PICKLEs`,
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
  }, [blockNum, transferStatus, address]);

  return (
    <>
      <Grid.Container gap={2}>
        <Grid xs={24} sm={24} md={24}>
          <Card>
            <h2>Claim</h2>
            <div>Weekly profit: ${formatNumber(dillStats?.weeklyProfit)}</div>
            &nbsp;
            <div>
              Weekly distribution: $
              {formatNumber(dillStats?.weeklyDistribution)}
            </div>
            &nbsp;
            <div>DILL holder APY: {formatPercent(dillAPY)}</div>
            &nbsp;
            <div>
              Next distribution: {dillStats.nextDistribution?.toDateString()}
            </div>
            &nbsp;
            <Spacer />
            <Button
              disabled={claimButton.disabled}
              onClick={() => {
                if (signer && address && feeShare) {
                  transfer({
                    token: "claim",
                    recipient: feeShare.address,
                    transferCallback: async () => {
                      return feeShare.connect(signer).claim(address, {
                        gasLimit: 1000000,
                      });
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
