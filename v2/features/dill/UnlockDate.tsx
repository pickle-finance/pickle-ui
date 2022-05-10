import React, { FC, useEffect, useState } from "react";
import { Trans, useTranslation } from "next-i18next";
import { IUserDillStats } from "picklefinance-core/lib/client/UserModel";
import dayjs from "dayjs";

import IncreaseLockDateModal from "v2/features/dill/IncreaseLockDateModal";
import Button from "v2/components/Button";
import DillCard from "./DillCard";
let duration = require('dayjs/plugin/duration')
dayjs.extend(duration)

interface Props {
  dill: IUserDillStats;
}

const UnlockDate: FC<Props> = ({ dill }) => {
  const { t } = useTranslation("common");
  const lockEnd = parseFloat(dill?.lockEnd) ? dayjs.unix(parseFloat(dill?.lockEnd)) : undefined;
  const date1 = dayjs(Date.now());
  const date2 = dayjs(lockEnd);
  
  const du = dayjs.duration(date2.diff(date1))
  const years = du.$d.years;
  const months = du.$d.months;
  const days = du.$d.days;
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      {/* <DillCard title={t("v2.dill.unlockDate")} data={lockEnd ? dayjs(lockEnd).format("LL") : "--"}>
        <Button
          state={parseFloat(dill?.pickleLocked) ? "enabled" : "disabled"}
          onClick={() => setIsOpen(true)}
        >
          +
        </Button>
      </DillCard> */}
      <aside className="border border-foreground-alt-500 grow font-title rounded-lg tracking-normal p-4">
        <h1 className="font-medium text-foreground-alt-200 text-base leading-5">
          {t("v2.dill.unlockDate")}
        </h1>
        <div className="flex justify-between items-top">
          <div>
            <br></br>
            <p className="text-primary whitespace-pre font-medium text-base">
              {/* {lockEnd ? dayjs(lockEnd).format("LL") : "--"} */}
              {lockEnd ? dayjs(lockEnd).format("MMM D[,] YYYY ") : "--"}
            </p>
            <br></br>
          </div>
          <Button
            state={parseFloat(dill?.pickleLocked) ? "enabled" : "disabled"}
            onClick={() => setIsOpen(true)}
          >
            +
          </Button>
        </div>
        <h1 className="font-body text-foreground-alt-200 font-normal text-xs leading-4">
        {/* {`${dayjs(lockEnd).diff(Date.now(),'days')} days`} */}
          {`${years} years, ${months} months, ${days} days`}
        </h1>
      </aside>
      {Boolean(parseFloat(dill?.pickleLocked)) && (
        <IncreaseLockDateModal isOpen={isOpen} closeModal={() => setIsOpen(false)} dill={dill} />
      )}
    </>
  );
};

export default UnlockDate;
