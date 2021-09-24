import { useState, FC, useEffect } from "react";
import { Button, Link, Input, Grid, Spacer } from "@geist-ui/react";
import { parseEther, formatEther } from "ethers/lib/utils";

import { useBalances } from "../../Balances/useBalances";
import { Contracts } from "../../../containers/Contracts";
import { Connection } from "../../../containers/Connection";

import { ERC20Transfer } from "../../../containers/Erc20Transfer";
import { UseDillOutput } from "../../../containers/Dill";
import { useButtonStatus, ButtonStatus } from "hooks/useButtonStatus";

const formatPickles = (num: number) =>
  num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });

export const IncreaseAmount: FC<{
  dillStats: UseDillOutput;
}> = () => {
  const { pickleBalance, pickleBN } = useBalances();
  const [lockAmount, setlockAmount] = useState("");
  const { setButtonStatus } = useButtonStatus();

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
                      gasLimit: 350000,
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
