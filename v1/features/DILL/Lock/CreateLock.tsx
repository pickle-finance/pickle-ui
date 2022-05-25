import { useState, FC, useEffect } from "react";
import { Button, Link, Input, Grid, Spacer, Radio } from "@geist-ui/react";
import { parseEther, formatEther } from "ethers/lib/utils";
import { Trans, useTranslation } from "next-i18next";

import { useBalances } from "../../Balances/useBalances";
import { Contracts } from "../../../containers/Contracts";
import { Connection } from "../../../containers/Connection";
import { useButtonStatus, ButtonStatus } from "v1/hooks/useButtonStatus";

import { ERC20Transfer } from "../../../containers/Erc20Transfer";
import { DayPicker } from "../../../components/DayPicker";
import { InputProps } from "@geist-ui/react/dist/input/input";
import { UseDillOutput } from "../../../containers/Dill";
import { getDayOffset, getEpochSecondForDay, getWeekDiff } from "../../../util/date";
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
  const { t } = useTranslation("common");

  const { blockNum, address, signer } = Connection.useContainer();
  const { pickle } = Contracts.useContainer();
  const { status: transferStatus, transfer, getTransferStatus } = ERC20Transfer.useContainer();

  const [lockButton, setLockButton] = useState<ButtonStatus>({
    disabled: false,
    text: t("dill.approveAndCreateLock"),
  });
  const [dateRadioValue, setDateRadioValue] = useState<number | undefined>(1);

  const dateAfter = roundDateByDillEpoch(getDayOffset(new Date(), 14));
  const dateBefore = roundDateByDillEpoch(getDayOffset(new Date(), 365 * 4 - 1));

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
        t("dill.locking"),
        approved ? t("dill.createLock") : t("dill.approveAndCreateLock"),
        setLockButton,
      );
    }
  }, [blockNum, transferStatus, approved]);

  const lockingWeeks = getWeekDiff(new Date(), unlockTime);

  const displayLockTime = () => {
    if (lockingWeeks < 52) {
      return (
        <Trans i18nKey="time.week" count={lockingWeeks}>
          {lockingWeeks} weeks
        </Trans>
      );
    } else {
      const years = Math.round(((+unlockTime - +new Date()) / 365 / 1000 / 3600 / 24) * 100) / 100;
      return (
        <Trans i18nKey="time.year" count={years}>
          {years} years
        </Trans>
      );
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
    if (unlockTimeRounded === roundDateByDillEpochSeconds(getLockTime(1))) setDateRadioValue(1);
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
                {t("balances.balance")}:{" "}
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
                {t("balances.max")}
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
              {t("dill.lockFor")}: {displayLockTime()}
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
                {t("balances.max")}
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
        <div>{t("dill.roundingNote")}</div>
        <Spacer y={0.5} />
        <Radio.Group
          onChange={(e) => setDateRadioValue(+e.toString())}
          value={dateRadioValue}
          useRow
        >
          <Radio value={1}>
            <Trans i18nKey="time.month" count={1}>
              1 month
            </Trans>
            <Radio.Desc style={{ color: "grey" }}>
              1 PICKLE = {estimateDillForPeriod(1, DAY * 30).toFixed(4)} DILL
            </Radio.Desc>
          </Radio>
          <Radio value={2}>
            <Trans i18nKey="time.year" count={1}>
              1 year
            </Trans>
            <Radio.Desc style={{ color: "grey" }}>
              1 PICKLE = {estimateDillForPeriod(1, DAY * 365).toFixed(4)} DILL
            </Radio.Desc>
          </Radio>
          <Radio value={3}>
            <Trans i18nKey="time.year" count={2}>
              2 years
            </Trans>
            <Radio.Desc style={{ color: "grey" }}>
              1 PICKLE = {estimateDillForPeriod(1, 2 * DAY * 365).toFixed(4)} DILL
            </Radio.Desc>
          </Radio>
          <Radio value={4}>
            <Trans i18nKey="time.year" count={4}>
              4 years
            </Trans>
            <Radio.Desc style={{ color: "grey" }}>
              1 PICKLE = {estimateDillForPeriod(1, 4 * DAY * 365).toFixed(4)} DILL
            </Radio.Desc>
          </Radio>
        </Radio.Group>
        <Spacer y={0.5} />
        <p>
          {t("dill.youWillReceive")}{" "}
          <strong>
            {lockAmount ? estimateDillForDate(+lockAmount, unlockTime).toFixed(4) : 0}{" "}
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
                    .create_lock(parseEther(lockAmount), getEpochSecondForDay(unlockTime), {
                      gasLimit: 600000,
                    });
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
