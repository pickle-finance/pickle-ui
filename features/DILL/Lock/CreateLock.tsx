import { useState, FC, useEffect } from "react";
import { Button, Link, Input, Grid, Spacer, Radio } from "@geist-ui/react";
import { parseEther, formatEther } from "ethers/lib/utils";

import { useBalances } from "../../Balances/useBalances";
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
  getDayOffset,
  getEpochSecondForDay,
  getWeekDiff,
} from "../../../util/date";
import { SelectPeriod } from "../../../components/SelectPeriod";
import { estimateDillForDate, estimateDillForPeriod } from "../../../util/dill";
import { ethers } from "ethers";

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
  } else if (status === ERC20TransferStatus.Transfering) {
    setButtonText({
      disabled: true,
      text: transfering,
    });
  } else {
    setButtonText({
      disabled: false,
      text: idle,
    });
  }
};

const DAY = 86400;
const WEEK = 7 * 86400;

export const CreateLock: FC<{
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

  const [lockButton, setLockButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Approve and Create Lock",
  });

  const dateAfter = getDayOffset(new Date(), 7);
  const dateBefore = getDayOffset(new Date(), 365 * 4);

  const [unlockTime, setUnlockTime] = useState(dateAfter);

  const handleDayChange = (selectedDay: Date) => {
    setUnlockTime(selectedDay);
  };

  const { dill } = Contracts.useContainer();

  const unlockTimeRounded =
    Math.floor(getEpochSecondForDay(unlockTime) / WEEK) * WEEK;

  const [approved, setApproved] = useState(false);

  useEffect(() => {
    if (pickle && dill && address) {
      const lockStatus = getTransferStatus(pickle.address, dill.address);

      setButtonStatus(
        lockStatus,
        "Locking...",
        approved ? "Create Lock" : "Approve and Create Lock",
        setLockButton,
      );
    }
  }, [blockNum, transferStatus, approved]);

  const lockingWeeks = getWeekDiff(new Date(), unlockTime);

  const displayLockTime = () => {
    if (lockingWeeks < 52) {
      return `${lockingWeeks} week${lockingWeeks > 1 ? "s" : ""}`;
    } else {
      const years = Number(lockingWeeks / 52).toFixed(1);
      return `${years} ${years === "1.0" ? "year" : "years"}`;
    }
  };

  const setLockTime = async (value: string) => {
    switch (value) {
      case "1":
        await setUnlockTime(getDayOffset(new Date(), 7));
        break;
      case "2":
        await setUnlockTime(getDayOffset(new Date(), 30));
        break;
      case "3":
        await setUnlockTime(getDayOffset(new Date(), 364));
        break;
      case "4":
        await setUnlockTime(getDayOffset(new Date(), 365 * 4));
        break;
    }
  };

  useEffect(() => {
    const checkAllowance = async () => {
      if (pickle && address && signer && dill) {
        const allowance = await pickle.allowance(address, dill.address);
        if (allowance.gt(ethers.constants.Zero)) {
          setApproved(true);
        }
      }
    };
    checkAllowance();
  }, [blockNum, address, pickle]);

  useEffect(() => {
    if (getEpochSecondForDay(unlockTime) !== unlockTimeRounded) {
      setUnlockTime(new Date(unlockTimeRounded * 1000));
    }
  }, [unlockTime, unlockTimeRounded]);

  return (
    <Grid.Container gap={2}>
      <Spacer y={0.5} />
      <Grid xs={24} md={24}>
        <Grid.Container gap={2}>
          <Grid xs={12} sm={12} md={12}>
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
          </Grid>
          <Grid xs={12} sm={12} md={12}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              Lock for: {displayLockTime()}
              <Link
                color
                href="#"
                onClick={(e) => {
                  if (pickleBN) {
                    e.preventDefault();
                    setUnlockTime(getDayOffset(new Date(), 365 * 4));
                  }
                }}
              >
                Max
              </Link>
            </div>
            <Spacer y={0.5} />
            {/* <SelectPeriod /> */}
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
          </Grid>
        </Grid.Container>
        <Spacer y={0.5} />
        <Radio.Group
          value="1"
          onChange={(e) => setLockTime(e.toString())}
          useRow
        >
          <Radio value="1">
            1 week
            <Radio.Desc style={{ color: "grey" }}>
              1 PICKLE = {estimateDillForPeriod(1, WEEK).toFixed(4)} DILL
            </Radio.Desc>
          </Radio>
          <Radio value="2">
            1 month
            <Radio.Desc style={{ color: "grey" }}>
              1 PICKLE = {estimateDillForPeriod(1, DAY * 30).toFixed(4)} DILL
            </Radio.Desc>
          </Radio>
          <Radio value="3">
            1 year
            <Radio.Desc style={{ color: "grey" }}>
              1 PICKLE = {estimateDillForPeriod(1, DAY * 365).toFixed(4)} DILL
            </Radio.Desc>
          </Radio>
          <Radio value="4">
            4 years
            <Radio.Desc style={{ color: "grey" }}>
              1 PICKLE = {estimateDillForPeriod(1, 4 * DAY * 365).toFixed(4)}{" "}
              DILL
            </Radio.Desc>
          </Radio>
        </Radio.Group>
        <Spacer y={0.5} />
        <p>
          You will receive{" "}
          <strong>
            {lockAmount
              ? estimateDillForDate(+lockAmount, unlockTime).toFixed(4)
              : 0}{" "}
          </strong>
          DILL
        </p>

        <Spacer y={1} />
        <Button
          disabled={lockButton.disabled || !+lockAmount}
          onClick={() => {
            if (pickle && signer && dill) {
              transfer({
                token: pickle.address,
                recipient: dill.address,
                transferCallback: async () => {
                  return dill
                    .connect(signer)
                    .create_lock(
                      parseEther(lockAmount),
                      getEpochSecondForDay(unlockTime),
                      {
                        gasLimit: 500000,
                      },
                    );
                },
              });
            }
          }}
          style={{ width: "100%" }}
        >
          {lockButton.text}
        </Button>
      </Grid>
    </Grid.Container>
  );
};
