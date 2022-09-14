import React, { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import { IUserDillStats } from "picklefinance-core/lib/client/UserModel";

import IncreaseLockDateModal from "v2/features/dill/IncreaseLockDateModal";
import WithdrawPicklesModal from "v2/features/dill/WithdrawPicklesModal";

import Button from "v2/components/Button";
import dayjs from "dayjs";

interface Props {
  dill: IUserDillStats;
}

const UnlockDate: FC<Props> = ({ dill }) => {
  const { t } = useTranslation("common");
  const lockEnd = parseFloat(dill?.lockEnd) ? dayjs.unix(parseFloat(dill?.lockEnd)) : undefined;
  const date1 = dayjs();
  const date2 = dayjs(lockEnd);
  const lockExpired = date2 < date1;
  const duration = dayjs.duration(date2.diff(date1));
  const days = duration.days();
  const years = duration.years();
  const months = duration.months();
  const [increaseLockIsOpen, setIncreaseLockIsOpen] = useState<boolean>(false);
  const [withdrawIsOpen, setWithdrawIsOpen] = useState<boolean>(false);

  return (
    <>
      <aside className="border border-foreground-alt-500 grow font-title rounded-lg tracking-normal p-4">
        <h1 className="font-medium text-foreground-alt-200 text-base leading-5">
          {t("v2.dill.unlockDate")}
        </h1>
        <div className="flex justify-between items-top">
          <p className="py-6 text-primary whitespace-pre font-medium text-base">
            {lockEnd
              ? lockExpired
                ? t("v2.dill.lockExpired", { date: dayjs(date2).format("L") }) //replace this with proper common.json string
                : dayjs(lockEnd).format("LL")
              : "--"}
          </p>
          {lockExpired ? (
            <Button
              state={parseFloat(dill?.pickleLocked) ? "enabled" : "disabled"}
              onClick={() => setWithdrawIsOpen(true)}
            >
              {t("v2.actions.withdraw")}
            </Button>
          ) : (
            <Button
              state={parseFloat(dill?.pickleLocked) ? "enabled" : "disabled"}
              onClick={() => setIncreaseLockIsOpen(true)}
            >
              +
            </Button>
          )}
        </div>
        {lockExpired ? (
          <h1 className="font-body text-foreground-alt-200 font-normal text-xs leading-4">
            {t("v2.dill.withdraw")}
          </h1>
        ) : (
          <h1 className="font-body text-foreground-alt-200 font-normal text-xs leading-4">
            {years
              ? years == 1
                ? t("v2.time.year")
                : t("v2.time.year_plural", { count: years })
              : ""}{" "}
            {months
              ? months == 1
                ? t("v2.time.month")
                : t("v2.time.month_plural", { count: months })
              : ""}{" "}
            {days ? (days == 1 ? t("v2.time.day") : t("v2.time.day_plural", { count: days })) : ""}
            {years || months || days ? "" : t("v2.dill.noTimeLockFound")}
          </h1>
        )}
      </aside>
      {Boolean(parseFloat(dill?.pickleLocked)) && (
        <IncreaseLockDateModal
          isOpen={increaseLockIsOpen}
          closeModal={() => setIncreaseLockIsOpen(false)}
          dill={dill}
        />
      )}
      {lockExpired && (
        <WithdrawPicklesModal
          isOpen={withdrawIsOpen}
          closeModal={() => setWithdrawIsOpen(false)}
          dill={dill}
        />
      )}
    </>
  );
};

export default UnlockDate;
