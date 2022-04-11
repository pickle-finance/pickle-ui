import React, { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import { IUserDillStats, UserPickles } from "picklefinance-core/lib/client/UserModel";

import GetDillModal from "v2/features/dill/GetDillModal";
import Button from "v2/components/Button";
import DillCard from "./DillCard";
import { formatEther } from "ethers/lib/utils";

interface Props {
  dill: IUserDillStats;
  pickles: UserPickles;
}

const DillAmount: FC<Props> = ({ dill, pickles }) => {
  const { t } = useTranslation("common");

  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <DillCard
        title={t("v2.dill.dillAmount")}
        data={parseFloat(formatEther(dill.balance)).toFixed(4)}
      >
        <Button type="primary" onClick={() => setIsOpen(true)}>
          {parseFloat(dill.balance) ? t("v2.dill.addDill") : t("v2.dill.getDill")}
        </Button>
      </DillCard>
      <GetDillModal
        isOpen={isOpen}
        dill={dill}
        pickles={pickles}
        closeModal={() => setIsOpen(false)}
      />
    </>
  );
};

export default DillAmount;
