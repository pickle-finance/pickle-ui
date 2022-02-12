import React, { FC, useState } from "react";
import { Trans, useTranslation } from "next-i18next";

import IncreaseLockDateModal from "v2/features/dill/IncreaseLockDateModal";
import Button from "v2/components/Button";
import DillCard from "./DillCard";

const UnlockDate: FC = () => {
  const { t } = useTranslation("common");

  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <DillCard
        title={t("v2.dill.unlockDate")}
        data={
          <Trans i18nKey="v2.time.day" count={0}>
            0 days
          </Trans>
        }
      >
        <Button onClick={() => setIsOpen(true)}>+</Button>
      </DillCard>
      <IncreaseLockDateModal
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
      />
    </>
  );
};

export default UnlockDate;
