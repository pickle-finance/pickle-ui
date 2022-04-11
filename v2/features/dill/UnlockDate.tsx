import React, { FC, useEffect, useState } from "react";
import { Trans, useTranslation } from "next-i18next";
import { IUserDillStats } from "picklefinance-core/lib/client/UserModel";
import dayjs from "dayjs";

import IncreaseLockDateModal from "v2/features/dill/IncreaseLockDateModal";
import Button from "v2/components/Button";
import DillCard from "./DillCard";

interface Props {
  dill: IUserDillStats;
}

const UnlockDate: FC<Props> = ({ dill }) => {
  const { t } = useTranslation("common");
  const lockEnd = parseFloat(dill?.lockEnd) ? dayjs.unix(parseFloat(dill?.lockEnd)) : undefined;

  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <DillCard title={t("v2.dill.unlockDate")} data={lockEnd ? dayjs(lockEnd).format("LL") : "--"}>
        <Button
          state={parseFloat(dill?.pickleLocked) ? "enabled" : "disabled"}
          onClick={() => setIsOpen(true)}
        >
          +
        </Button>
      </DillCard>
      {Boolean(parseFloat(dill?.pickleLocked)) && (
        <IncreaseLockDateModal isOpen={isOpen} closeModal={() => setIsOpen(false)} dill={dill} />
      )}
    </>
  );
};

export default UnlockDate;
