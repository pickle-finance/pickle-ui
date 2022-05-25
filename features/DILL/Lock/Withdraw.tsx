import { useState, FC, useEffect } from "react";
import { Button, Grid, Spacer } from "@geist-ui/react";
import { useTranslation } from "next-i18next";

import { Contracts } from "../../../containers/Contracts";
import { Connection } from "../../../containers/Connection";

import { ERC20Transfer } from "../../../containers/Erc20Transfer";
import { UseDillOutput } from "../../../containers/Dill";
import { useButtonStatus, ButtonStatus } from "v1/hooks/useButtonStatus";

export const Withdraw: FC<{
  dillStats: UseDillOutput;
}> = () => {
  const { blockNum, address, signer } = Connection.useContainer();
  const { pickle } = Contracts.useContainer();
  const { status: transferStatus, transfer, getTransferStatus } = ERC20Transfer.useContainer();
  const { t } = useTranslation("common");
  const { setButtonStatus } = useButtonStatus();

  const [withdrawButton, setWithdrawButton] = useState<ButtonStatus>({
    disabled: false,
    text: t("farms.withdraw"),
  });

  const { dill } = Contracts.useContainer();

  useEffect(() => {
    if (pickle && dill && address) {
      const withdrawStatus = getTransferStatus(pickle.address, dill.address);

      setButtonStatus(
        withdrawStatus,
        t("farms.withdrawing"),
        t("farms.withdraw"),
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
