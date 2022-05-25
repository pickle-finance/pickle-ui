import { useState, FC, useEffect } from "react";
import { Button, Link, Input, Grid, Spacer, Radio } from "@geist-ui/react";
import { Trans, useTranslation } from "next-i18next";

import { Contracts } from "../../../containers/Contracts";
import { Connection } from "../../../containers/Connection";

import { ERC20Transfer } from "../../../containers/Erc20Transfer";
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
import { useButtonStatus, ButtonStatus } from "v1/hooks/useButtonStatus";

const DAY = 86400;
const WEEK = 7 * 86400;

export const IncreaseTime: FC<{
  dillStats: UseDillOutput;
}> = ({ dillStats }) => {
  const { blockNum, address, signer } = Connection.useContainer();
  const { pickle } = Contracts.useContainer();
  const { status: transferStatus, transfer, getTransferStatus } = ERC20Transfer.useContainer();
  const { setButtonStatus } = useButtonStatus();
  const { t } = useTranslation("common");

  const [extendButton, setExtendButton] = useState<ButtonStatus>({
    disabled: false,
    text: t("dill.extendLockTime"),
  });
  const lockEndDate = dateFromEpoch(+(dillStats.lockEndDate?.toString() || 0));

  let dateAfter: Date;
  if (dillStats.lockEndDate?.toString()) {
    dateAfter = roundDateByDillEpoch(getDayOffset(lockEndDate, 14));
  } else {
    dateAfter = roundDateByDillEpoch(getDayOffset(new Date(), 14));
  }
  const dateBefore = roundDateByDillEpoch(getDayOffset(new Date(), 365 * 4 - 1));

  const [unlockTime, setUnlockTime] = useState(dateAfter);

  const handleDayChange = (selectedDay: Date) => {
    setUnlockTime(selectedDay);
  };

  const { dill } = Contracts.useContainer();

  const [dateRadioValue, setDateRadioValue] = useState<number | undefined>(1);

  useEffect(() => {
    if (pickle && dill && address) {
      const extendStatus = getTransferStatus("extend", dill.address);

      setButtonStatus(extendStatus, t("dill.extending"), t("dill.extendLockTime"), setExtendButton);
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

  const unlockTimeRounded = Math.floor(getEpochSecondForDay(unlockTime) / WEEK) * WEEK;

  const maxDateRounded = new Date(
    Math.floor(getEpochSecondForDay(dateBefore) / WEEK) * WEEK * 1000,
  );

  const displayLockExtend = () => {
    if (isInvalidLockDate)
      return t("dill.lockTimeInvalid", {
        duration: formatDate(maxDateRounded),
      });
    if (lockingWeeks < 52) {
      return (
        <Trans i18nKey="time.week" count={lockingWeeks}>
          {lockingWeeks} weeks
        </Trans>
      );
    } else {
      const years = Math.round(((+unlockTime - +lockEndDate) / 365 / 1000 / 3600 / 24) * 100) / 100;
      return (
        <Trans i18nKey="time.year" count={years}>
          {years} years
        </Trans>
      );
    }
  };

  const displayTotalLock = () => {
    if (totalLockingWeeks < 52) {
      return (
        <Trans i18nKey="time.week" count={totalLockingWeeks}>
          {totalLockingWeeks} weeks
        </Trans>
      );
    } else {
      const years = Math.round(((+unlockTime - +new Date()) / 365 / 1000 / 3600 / 24) * 100) / 100;
      return (
        <>
          <Trans i18nKey="time.year" count={years}>
            {years} years
          </Trans>{" "}
          (
          <Trans i18nKey="time.week" count={totalLockingWeeks}>
            {totalLockingWeeks} weeks
          </Trans>
          )
        </>
      );
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
    if (unlockTimeRounded === roundDateByDillEpochSeconds(getLockTime(1))) setDateRadioValue(1);
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
            {t("dill.extendLockBy")}:{" "}
            <span style={isInvalidLockDate ? { color: "red" } : {}}>{displayLockExtend()}</span>
          </div>
          <Link
            color
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setUnlockTime(maxDateRounded);
            }}
          >
            {t("balances.max")}
          </Link>
        </div>
        <div style={{ marginTop: 5 }}>
          {t("dill.lockExpiration")}:{" "}
          <span style={isInvalidLockDate ? { color: "red" } : {}}>{displayTotalLock()}</span>
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
        <div>{t("dill.roundingNote")}</div>
        <Spacer y={0.5} />
        <Radio.Group onChange={(e) => setDateRadioValue(+e.toString())} useRow>
          <Radio value={1} checked={dateRadioValue === 1}>
            <Trans i18nKey="time.month" count={1}>
              1 month
            </Trans>
            <Radio.Desc style={{ color: "grey" }}>
              1 PICKLE = {estimateDillForPeriod(1, DAY * 30).toFixed(4)} DILL
            </Radio.Desc>
          </Radio>
          <Radio value={2} checked={dateRadioValue === 2}>
            <Trans i18nKey="time.year" count={1}>
              1 year
            </Trans>
            <Radio.Desc style={{ color: "grey" }}>
              1 PICKLE = {estimateDillForPeriod(1, DAY * 365).toFixed(4)} DILL
            </Radio.Desc>
          </Radio>
          <Radio value={3} checked={dateRadioValue === 3}>
            <Trans i18nKey="time.year" count={2}>
              2 years
            </Trans>
            <Radio.Desc style={{ color: "grey" }}>
              1 PICKLE = {estimateDillForPeriod(1, 2 * DAY * 365).toFixed(4)} DILL
            </Radio.Desc>
          </Radio>
          <Radio value={4} checked={dateRadioValue === 4}>
            <Trans i18nKey="time.year" count={4}>
              4 years
            </Trans>
            <Radio.Desc style={{ color: "grey" }}>
              1 PICKLE = {estimateDillForPeriod(1, 4 * DAY * 365).toFixed(4)} DILL
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
