import { useState, FC, useEffect } from "react";
import { Button, Grid, Spacer } from "@geist-ui/react";
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

export const Withdraw: FC<{
  dillStats: UseDillOutput;
}> = () => {
  const { blockNum, address, signer } = Connection.useContainer();
  const { pickle } = Contracts.useContainer();
  const {
    status: transferStatus,
    transfer,
    getTransferStatus,
  } = ERC20Transfer.useContainer();

  const [withdrawButton, setWithdrawButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Withdraw",
  });

  const { dill } = Contracts.useContainer();

  useEffect(() => {
    if (pickle && dill && address) {
      const withdrawStatus = getTransferStatus(pickle.address, dill.address);

      setButtonStatus(
        withdrawStatus,
        "Withdrawing...",
        "Withdraw",
        setWithdrawButton,
      );
    }
  }, [blockNum, transferStatus]);

  return (
    <Grid.Container gap={2}>
      <Spacer y={0.5} />
      <Grid xs={24} md={24}>
        <Button
          disabled={withdrawButton.disabled}
          onClick={() => {
            if (pickle && signer && dill) {
              transfer({
                token: "withdraw",
                approval: false,
                recipient: dill.address,
                transferCallback: async () => {
                  return dill.connect(signer).withdraw({ gasLimit: 500000 });
                },
              });
            }
          }}
          style={{ width: "100%" }}
        >
          {withdrawButton.text}
        </Button>
      </Grid>
    </Grid.Container>
  );
};
