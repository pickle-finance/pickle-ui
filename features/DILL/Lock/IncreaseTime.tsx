import { useState, FC, useEffect } from "react";
import { Button, Link, Input, Grid, Spacer } from "@geist-ui/react";

import { Contracts } from "../../../containers/Contracts";
import { Connection } from "../../../containers/Connection";

import {
  ERC20Transfer,
  Status as ERC20TransferStatus,
} from "../../../containers/Erc20Transfer";
import { DayPicker } from "../../../components/DayPicker";
import { InputProps } from "@geist-ui/react/dist/input/input";
import { UseDillOutput } from "../../../containers/Dill";
import {
  dateFromEpoch,
  getDayOffset,
  getEpochSecondForDay,
  getWeekDiff,
} from "../../../utils/date";

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

export const IncreaseTime: FC<{
  dillStats: UseDillOutput;
}> = ({ dillStats }) => {
  const { blockNum, address, signer } = Connection.useContainer();
  const { pickle } = Contracts.useContainer();
  const {
    status: transferStatus,
    transfer,
    getTransferStatus,
  } = ERC20Transfer.useContainer();

  const [extendButton, setExtendButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Extend Lock Time",
  });

  let dateAfter;
  if (dillStats.lockEndDate?.toString()) {
    dateAfter = getDayOffset(
      dateFromEpoch(+(dillStats.lockEndDate?.toString() || 0)),
      7,
    );
  } else {
    dateAfter = getDayOffset(new Date(), 7);
  }
  const dateBefore = getDayOffset(new Date(), 365 * 4);

  const [unlockTime, setUnlockTime] = useState(dateAfter);

  const handleDayChange = (selectedDay: Date) => {
    setUnlockTime(selectedDay);
  };

  const { dill } = Contracts.useContainer();

  useEffect(() => {
    if (pickle && dill && address) {
      const extendStatus = getTransferStatus("extend", dill.address);

      setButtonStatus(
        extendStatus,
        "Extending...",
        "Extend Lock Time",
        setExtendButton,
      );
    }
  }, [blockNum, transferStatus]);

  const lockingWeeks = getWeekDiff(new Date(), unlockTime);

  return (
    <Grid.Container gap={2}>
      <Spacer y={0.5} />
      <Grid xs={24} md={24}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            Lock for: {lockingWeeks} week{lockingWeeks > 1 ? "s" : ""}
          </div>
          <Link
            color
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setUnlockTime(getDayOffset(new Date(), 365 * 4));
            }}
          >
            Max
          </Link>
        </div>
        <Spacer y={0.5} />
        <DayPicker
          value={unlockTime}
          onDayChange={handleDayChange}
          dayPickerProps={{
            modifiers: { range: { from: dateAfter, to: dateBefore } },
          }}
          keepFocus={true}
          component={(props: InputProps) => (
            <Input
              {...props}
              width="100%"
              size="large"
              placeholder=""
              readOnly
              css={{ cursor: "pointer", "& input": { cursor: "pointer" } }}
            />
          )}
          style={{ width: "100%" }}
        />
        <Spacer y={0.5} />
        <Button
          disabled={extendButton.disabled}
          onClick={() => {
            if (pickle && signer && dill) {
              transfer({
                token: "extend",
                recipient: dill.address,
                transferCallback: async () => {
                  return dill
                    .connect(signer)
                    .increase_unlock_time(getEpochSecondForDay(unlockTime), {
                      gasLimit: 1000000,
                    });
                },
                approval: false,
              });
            }
          }}
          style={{ width: "100%" }}
        >
          {extendButton.text}
        </Button>
      </Grid>
    </Grid.Container>
  );
};
