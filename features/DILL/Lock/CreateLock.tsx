import { useState, FC, useEffect } from "react";
import { Button, Link, Input, Grid, Spacer, Radio } from "@geist-ui/react";
import { parseEther, formatEther } from "ethers/lib/utils";

import { useBalances } from "../../Balances/useBalances";
import { Contracts } from "../../../containers/Contracts";
import { Connection } from "../../../containers/Connection";
import { useButtonStatus, ButtonStatus } from "hooks/useButtonStatus";

import { ERC20Transfer } from "../../../containers/Erc20Transfer";
import { DayPicker } from "../../../components/DayPicker";
import { InputProps } from "@geist-ui/react/dist/input/input";
import { UseDillOutput } from "../../../containers/Dill";
import {
  getDayOffset,
  getEpochSecondForDay,
  getWeekDiff,
} from "../../../util/date";
import {
  estimateDillForDate,
  estimateDillForPeriod,
  roundDateByDillEpoch,
  roundDateByDillEpochSeconds,
} from "../../../util/dill";
import { ethers } from "ethers";

const formatPickles = (num: number) =>
  num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });

const DAY = 86400;

export const CreateLock: FC<{
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

  const [lockButton, setLockButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Approve and Create Lock",
  });
  const [dateRadioValue, setDateRadioValue] = useState<number | undefined>(1);

  const dateAfter = roundDateByDillEpoch(getDayOffset(new Date(), 14));
  const dateBefore = roundDateByDillEpoch(
    getDayOffset(new Date(), 365 * 4 - 1),
  );

  const [unlockTime, setUnlockTime] = useState(dateAfter);

  const handleDayChange = (selectedDay: Date) => {
    setUnlockTime(selectedDay);
  };

  const { dill } = Contracts.useContainer();

  const unlockTimeRounded = roundDateByDillEpochSeconds(unlockTime);

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
      const years = Number(
        (+unlockTime - +new Date()) / 365 / 1000 / 3600 / 24,
      ).toFixed(2);
      return `${years} ${
        years === "1.0" ? "year" : "years"
      } (${lockingWeeks} weeks)`;
    }
  };

  const getLockTime = (value: number | undefined): Date => {
    switch (value) {
      case 1:
        return getDayOffset(new Date(), 30);
      case 2:
        return getDayOffset(new Date(), 365);
      case 3:
        return getDayOffset(new Date(), 2 * 365);
      case 4:
        return getDayOffset(new Date(), 365 * 4 - 1);
    }
    return (undefined as unknown) as Date;
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

  useEffect(() => {
    const date = getLockTime(dateRadioValue);
    if (dateRadioValue && date) {
      setUnlockTime(date);
    }
  }, [dateRadioValue]);

  useEffect(() => {
    if (unlockTimeRounded === roundDateByDillEpochSeconds(getLockTime(1)))
      setDateRadioValue(1);
    else if (unlockTimeRounded === roundDateByDillEpochSeconds(getLockTime(2)))
      setDateRadioValue(2);
    else if (unlockTimeRounded === roundDateByDillEpochSeconds(getLockTime(3)))
      setDateRadioValue(3);
    else if (unlockTimeRounded === roundDateByDillEpochSeconds(getLockTime(4)))
      setDateRadioValue(4);
    else setDateRadioValue(undefined);
  }, [unlockTimeRounded]);

  return (
    <Grid.Container gap={2}>
      <Spacer y={0.5} />
      <Grid xs={24}>
        <Grid.Container gap={2}>
          <Grid xs={24}>
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
          <Grid xs={24}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              Lock for: {displayLockTime()}
              <Link
                color
                href="#"
                onClick={(e) => {
                  if (pickleBN) {
                    e.preventDefault();
                    setUnlockTime(dateBefore);
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
        <div>
          Note: your selected date will be rounded to the nearest weekly DILL
          epoch
        </div>
        <Spacer y={0.5} />
        <Radio.Group
          onChange={(e) => setDateRadioValue(+e.toString())}
          value={dateRadioValue}
          useRow
        >
          <Radio value={1}>
            1 month
            <Radio.Desc style={{ color: "grey" }}>
              1 PICKLE = {estimateDillForPeriod(1, DAY * 30).toFixed(4)} DILL
            </Radio.Desc>
          </Radio>
          <Radio value={2}>
            1 year
            <Radio.Desc style={{ color: "grey" }}>
              1 PICKLE = {estimateDillForPeriod(1, DAY * 365).toFixed(4)} DILL
            </Radio.Desc>
          </Radio>
          <Radio value={3}>
            2 years
            <Radio.Desc style={{ color: "grey" }}>
              1 PICKLE = {estimateDillForPeriod(1, 2 * DAY * 365).toFixed(4)}{" "}
              DILL
            </Radio.Desc>
          </Radio>
          <Radio value={4}>
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
                        gasLimit: 600000,
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
