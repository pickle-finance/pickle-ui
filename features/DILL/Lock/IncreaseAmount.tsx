import { useState, FC, useEffect } from "react";
import { Button, Link, Input, Grid, Spacer } from "@geist-ui/react";
import { parseEther, formatEther } from "ethers/lib/utils";

import { useBalances } from "../../Balances/useBalances";
import { Contracts } from "../../../containers/Contracts";
import { Connection } from "../../../containers/Connection";

import {
  ERC20Transfer,
  Status as ERC20TransferStatus,
} from "../../../containers/Erc20Transfer";
import { UseDillOutput } from "../../../containers/Dill";

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

export const IncreaseAmount: FC<{
  dillStats: UseDillOutput;
}> = () => {
  const { pickleBalance, pickleBN } = useBalances();
  const [lockAmount, setlockAmount] = useState("");

  const { blockNum, address, signer } = Connection.useContainer();
  const { pickle } = Contracts.useContainer();
  const {
    status: transferStatus,
    transfer,
    getTransferStatus,
  } = ERC20Transfer.useContainer();

  const [increaseButton, setIncreaseButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Increase Lock Amount",
  });

  const { dill } = Contracts.useContainer();

  useEffect(() => {
    if (pickle && dill && address) {
      const increaseStatus = getTransferStatus(pickle.address, dill.address);

      setButtonStatus(
        increaseStatus,
        "Locking...",
        "Increase Lock Amount",
        setIncreaseButton,
      );
    }
  }, [blockNum, transferStatus]);

  return (
    <Grid.Container gap={2}>
      <Spacer y={0.5} />
      <Grid xs={24} md={24}>
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
                setlockAmount(formatEther(pickleBN));
              }
            }}
          >
            Max
          </Link>
        </div>
        <Spacer y={0.5} />
        <Input
          onChange={(e) => setlockAmount(e.target.value)}
          value={lockAmount}
          width="100%"
          type="number"
          size="large"
        />
        <Spacer y={0.5} />
        <Button
          disabled={increaseButton.disabled || !+lockAmount}
          onClick={() => {
            if (pickle && signer && dill) {
              transfer({
                token: pickle.address,
                recipient: dill.address,
                transferCallback: async () => {
                  return dill
                    .connect(signer)
                    .increase_amount(parseEther(lockAmount), {
                      gasLimit: 2800000,
                    });
                },
              });
            }
          }}
          style={{ width: "100%" }}
        >
          {increaseButton.text}
        </Button>
      </Grid>
    </Grid.Container>
  );
};
