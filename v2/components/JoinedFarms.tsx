import { FC } from "react";
import { useTranslation } from "next-i18next";

import FarmsTable from "./FarmsTable";

const JoinedFarms: FC = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <h2 className="font-body font-bold text-xl mb-6">
        {t("v2.dashboard.joinedFarms")}
      </h2>
      <FarmsTable />
    </>
  );
};

export default JoinedFarms;
