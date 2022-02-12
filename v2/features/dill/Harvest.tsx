import React, { FC } from "react";
import { useTranslation } from "next-i18next";

import Button from "v2/components/Button";
import DillCard from "./DillCard";

const Harvest: FC = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <DillCard title={t("v2.dill.earnedPickles")} data={0}>
        <Button>{t("v2.actions.harvest")}</Button>
      </DillCard>
    </>
  );
};

export default Harvest;
