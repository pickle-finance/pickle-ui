import { useState, FC, useEffect } from "react";
import { Button, Link, Input, Grid, Spacer, Card } from "@geist-ui/react";
import { parseEther, formatEther } from "ethers/lib/utils";

import { useBalances } from "../Balances/useBalances";
import { Contracts } from "../../containers/Contracts";
import { Connection } from "../../containers/Connection";
import { UseStakingRewardsOutput } from "../../containers/Staking/useStakingRewards";

import {
  ERC20Transfer,
  Status as ERC20TransferStatus,
} from "../../containers/Erc20Transfer";

interface ButtonStatus {
  disabled: boolean;
  text: string;
}

const formatPickles = (num: number) =>
  num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });

const setButtonStatus = (
  status: ERC20TransferStatus,
  transfering: string,
  idle: string,
  setButtonText: (arg0: ButtonStatus) => void,
) => {
  // Deposit
  if (status === ERC20TransferStatus.Approving) {
    setButtonText({
      disabled: true,
      text: "Approving...",
    });
  }
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

export const Interaction: FC<{
  stakingRewards: UseStakingRewardsOutput;
}> = ({ stakingRewards }) => {
  const { pickleBalance, pickleBN } = useBalances();
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");

  const { blockNum, address, signer } = Connection.useContainer();
  const { pickle } = Contracts.useContainer();
  const { staked, pickleStakingRewards } = stakingRewards;
  const {
    status: transferStatus,
    transfer,
    getTransferStatus,
  } = ERC20Transfer.useContainer();

  const [stakeButton, setStakeButton] = useState<ButtonStatus>({
    disabled: true,
    text: "Stake",
  });
  const [unstakeButton, setUnstakeButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Unstake",
  });
  const [claimButton, setClaimButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Claim Rewards",
  });
  const [exitButton, setExitButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Exit: Claim and Unstake",
  });

  useEffect(() => {
    if (pickle && pickleStakingRewards && address) {
      const stakeStatus = getTransferStatus(
        pickle.address,
        pickleStakingRewards.address,
      );

      const unstakeStatus = getTransferStatus(
        pickleStakingRewards.address,
        address,
      );

      const claimStatus = getTransferStatus(
        "claim",
        pickleStakingRewards.address,
      );

      const exitStatus = getTransferStatus(
        "exit",
        pickleStakingRewards.address,
      );

      setButtonStatus(stakeStatus, "Staking...", "Stake", setStakeButton);
      setButtonStatus(
        unstakeStatus,
        "Unstaking...",
        "Unstake",
        setUnstakeButton,
      );
      setButtonStatus(
        claimStatus,
        "Claming Rewards...",
        "Claim Rewards",
        setClaimButton,
      );
      setButtonStatus(
        exitStatus,
        "Exiting...",
        "Exit: Claim and Unstake",
        setExitButton,
      );
    }
  }, [blockNum, transferStatus]);

  return (
    <Card>
      <h2>Stake/Unstake PICKLEs</h2>
      <Grid.Container gap={2}>
        <Grid xs={24} md={12}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              Balance:{" "}
              {pickleBalance !== null ? formatPickles(pickleBalance) : "--"}
            </div>
            <Link
              color
              href="#"
              onClick={(e) => {
                if (pickleBN) {
                  e.preventDefault();
                  setStakeAmount(formatEther(pickleBN));
                }
              }}
            >
              Max
            </Link>
          </div>
          <Spacer y={0.5} />
          <Input
            onChange={(e) => setStakeAmount(e.target.value)}
            value={stakeAmount}
            width="100%"
            type="number"
            size="large"
          />
          <Spacer y={0.5} />
          <Button
            disabled={stakeButton.disabled}
            onClick={() => {
              if (pickle && signer && pickleStakingRewards) {
                transfer({
                  token: pickle.address,
                  recipient: pickleStakingRewards.address,
                  transferCallback: async () => {
                    return pickleStakingRewards
                      .connect(signer)
                      .stake(parseEther(stakeAmount));
                  },
                });
              }
            }}
            style={{ width: "100%" }}
          >
            {stakeButton.text}
          </Button>
        </Grid>
        <Grid xs={24} md={12}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>Staked: {staked !== null ? formatEther(staked) : "--"}</div>
            <Link
              color
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (staked) {
                  setUnstakeAmount(formatEther(staked));
                }
              }}
            >
              Max
            </Link>
          </div>
          <Spacer y={0.5} />
          <Input
            onChange={(e) => setUnstakeAmount(e.target.value)}
            value={unstakeAmount}
            width="100%"
            type="number"
            size="large"
          />
          <Spacer y={0.5} />
          <Button
            disabled={unstakeButton.disabled}
            onClick={() => {
              if (pickle && address && signer && pickleStakingRewards) {
                transfer({
                  token: pickleStakingRewards.address,
                  recipient: address,
                  transferCallback: async () => {
                    return pickleStakingRewards
                      .connect(signer)
                      .withdraw(parseEther(unstakeAmount));
                  },
                  approval: false,
                });
              }
            }}
            style={{ width: "100%" }}
          >
            {unstakeButton.text}
          </Button>
        </Grid>
        <Spacer />
        <Grid xs={24}>
          <Spacer />
          <Button
            disabled={claimButton.disabled}
            onClick={() => {
              if (pickle && signer && pickleStakingRewards) {
                transfer({
                  token: "claim",
                  recipient: pickleStakingRewards.address,
                  transferCallback: async () => {
                    return pickleStakingRewards.connect(signer).getReward();
                  },
                  approval: false,
                });
              }
            }}
            style={{ width: "100%" }}
          >
            {claimButton.text}
          </Button>
          <Spacer y={1} />
          <Button
            disabled={exitButton.disabled}
            onClick={() => {
              if (pickle && signer && pickleStakingRewards) {
                transfer({
                  token: "exit",
                  recipient: pickleStakingRewards.address,
                  transferCallback: async () => {
                    return pickleStakingRewards.connect(signer).exit();
                  },
                  approval: false,
                });
              }
            }}
            style={{ width: "100%" }}
          >
            {exitButton.text}
          </Button>
        </Grid>
      </Grid.Container>
    </Card>
  );
};
