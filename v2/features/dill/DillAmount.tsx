import React, { FC, useState } from "react";
import { useTranslation } from "next-i18next";

import GetDillModal from "v2/features/dill/GetDillModal";
import Button from "v2/components/Button";
import DillCard from "./DillCard";

interface Props {
  dillBalance: number;
  pickleBalance: number;
}

const DillAmount: FC<Props> = ({ dillBalance, pickleBalance }) => {
  const { t } = useTranslation("common");

  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <DillCard title={t("v2.dill.dillAmount")} data={dillBalance.toFixed(4)}>
        <Button type="primary" onClick={() => setIsOpen(true)}>
          {t("v2.dill.getDill")}
        </Button>
      </DillCard>
      <GetDillModal
        pickleBalance={pickleBalance}
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
      />
    </>
  );
};

export default DillAmount;
