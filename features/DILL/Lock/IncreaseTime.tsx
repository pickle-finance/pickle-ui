import { useState, FC, useEffect } from "react";
import { Button, Link, Input, Grid, Spacer, Radio } from "@geist-ui/react";

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
  getDayDiff,
  formatDate,
} from "../../../util/date";
import {
  estimateDillForPeriod,
  roundDateByDillEpoch,
  roundDateByDillEpochSeconds,
} from "../../../util/dill";

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

const DAY = 86400;
const WEEK = 7 * 86400;

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
  const lockEndDate = dateFromEpoch(+(dillStats.lockEndDate?.toString() || 0));

  let dateAfter: Date;
  if (dillStats.lockEndDate?.toString()) {
    dateAfter = roundDateByDillEpoch(getDayOffset(lockEndDate, 14));
  } else {
    dateAfter = roundDateByDillEpoch(getDayOffset(new Date(), 14));
  }
  const dateBefore = roundDateByDillEpoch(
    getDayOffset(new Date(), 365 * 4 - 1),
  );

  const [unlockTime, setUnlockTime] = useState(dateAfter);

  const handleDayChange = (selectedDay: Date) => {
    setUnlockTime(selectedDay);
  };

  const { dill } = Contracts.useContainer();

  const [dateRadioValue, setDateRadioValue] = useState<number | undefined>(1);

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

  const isInvalidLockDate = getDayDiff(unlockTime, dateBefore) < 0;

  const lockingWeeks = getWeekDiff(lockEndDate, unlockTime);
  const totalLockingWeeks = getWeekDiff(new Date(), unlockTime);

  const getLockTime = (value: number | undefined): Date => {
    switch (value) {
      case 1:
        return getDayOffset(lockEndDate, 30);
      case 2:
        return getDayOffset(lockEndDate, 365);
      case 3:
        return getDayOffset(lockEndDate, 2 * 365);
      case 4:
        return getDayOffset(lockEndDate, 4 * 365 - 1);
    }
    return (null as unknown) as Date;
  };

  const unlockTimeRounded =
    Math.floor(getEpochSecondForDay(unlockTime) / WEEK) * WEEK;

  const maxDateRounded = new Date(
    Math.floor(getEpochSecondForDay(dateBefore) / WEEK) * WEEK * 1000,
  );

  const displayLockExtend = () => {
    if (isInvalidLockDate)
      return `selected lock time exceeds maximum lock time of ${formatDate(
        maxDateRounded,
      )}`;
    if (lockingWeeks < 52) {
      return `${lockingWeeks} week${lockingWeeks > 1 ? "s" : ""}`;
    } else {
      const years = Number(
        (+unlockTime - +lockEndDate) / 365 / 1000 / 3600 / 24,
      ).toFixed(2);
      return `${years} ${
        years === "1.0" ? "year" : "years"
      } (${lockingWeeks} weeks)`;
    }
  };

  const displayTotalLock = () => {
    if (totalLockingWeeks < 52) {
      return `${totalLockingWeeks} week${totalLockingWeeks > 1 ? "s" : ""}`;
    } else {
      const years = Number(
        (+unlockTime - +new Date()) / 365 / 1000 / 3600 / 24,
      ).toFixed(2);
      return `${years} ${
        years === "1.0" ? "year" : "years"
      } (${totalLockingWeeks} weeks)`;
    }
  };

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

  if (dateAfter > dateBefore) return <></>;

  return (
    <Grid.Container gap={2}>
      <Spacer y={0.5} />
      <Grid xs={24} md={24}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            Extend lock by:{" "}
            <span style={isInvalidLockDate ? { color: "red" } : null}>
              {displayLockExtend()}
            </span>
          </div>
          <Link
            color
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setUnlockTime(maxDateRounded);
            }}
          >
            Max
          </Link>
        </div>
        <div style={{ marginTop: 5 }}>
          Lock will expire in:{" "}
          <span style={isInvalidLockDate ? { color: "red" } : null}>
            {displayTotalLock()}
          </span>
        </div>
        <Spacer y={0.5} />
        <DayPicker
          value={unlockTime}
          onDayChange={handleDayChange}
          dayPickerProps={{
            modifiers: {
              range: { from: dateAfter, to: maxDateRounded },
            },
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
        <div>
          Note: your selected date will be rounded to the nearest weekly DILL
          epoch
        </div>
        <Spacer y={0.5} />
        <Radio.Group onChange={(e) => setDateRadioValue(+e.toString())} useRow>
          <Radio value={1} checked={dateRadioValue === 1}>
            1 month
            <Radio.Desc style={{ color: "grey" }}>
              1 PICKLE = {estimateDillForPeriod(1, DAY * 30).toFixed(4)} DILL
            </Radio.Desc>
          </Radio>
          <Radio value={2} checked={dateRadioValue === 2}>
            1 year
            <Radio.Desc style={{ color: "grey" }}>
              1 PICKLE = {estimateDillForPeriod(1, DAY * 365).toFixed(4)} DILL
            </Radio.Desc>
          </Radio>
          <Radio value={3} checked={dateRadioValue === 3}>
            2 years
            <Radio.Desc style={{ color: "grey" }}>
              1 PICKLE = {estimateDillForPeriod(1, 2 * DAY * 365).toFixed(4)}{" "}
              DILL
            </Radio.Desc>
          </Radio>
          <Radio value={4} checked={dateRadioValue === 4}>
            4 years
            <Radio.Desc style={{ color: "grey" }}>
              1 PICKLE = {estimateDillForPeriod(1, 4 * DAY * 365).toFixed(4)}{" "}
              DILL
            </Radio.Desc>
          </Radio>
        </Radio.Group>
        <Spacer y={1.5} />
        <Button
          disabled={extendButton.disabled || isInvalidLockDate}
          onClick={() => {
            if (pickle && signer && dill) {
              transfer({
                token: "extend",
                recipient: dill.address,
                transferCallback: async () => {
                  return dill
                    .connect(signer)
                    .increase_unlock_time(getEpochSecondForDay(unlockTime), {
                      gasLimit: 350000,
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
