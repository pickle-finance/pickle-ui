import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import { useSelector } from "react-redux";

import type { PickleFinancePage } from "v2/types";
import { HistoricChart } from "v2/features/dill/HistoricChart";
import { RevenueStats } from "v2/features/dill/RevenueStats";
import { CoreSelectors } from "v2/store/core";
import { DillInfo } from "v2/features/dill/DillInfo";

const Farms: PickleFinancePage = () => {
  const [isReadMore, setIsReadMore] = useState(false);
  const core = useSelector(CoreSelectors.selectCore);
  const { t } = useTranslation("common");

  return (
    <div>
      <p>
        {isReadMore
          ? t("dill.description")
          : t("dill.description").substring(0, 50)}{" "}
        <span
          onClick={() => setIsReadMore(!isReadMore)}
          className="font-bold cursor-pointer text-orange"
        >
          {isReadMore ? "Read less" : "Read more"}
        </span>
      </p>
      <DillInfo />
      <h1 className="font-title font-medium text-xl sm:text-xl pt-10 pb-2 pl-1">
        {t("dill.revenueShareStats")}
      </h1>
      <RevenueStats dill={core?.dill} />
      <HistoricChart />
    </div>
  );
};

const PageTitle: FC = () => {
  const { t } = useTranslation("common");

  return (
    <h1 className="font-title font-medium text-2xl sm:text-3xl pt-2">
      {t("v2.nav.dill")}
    </h1>
  );
};

Farms.PageTitle = PageTitle;

export { getStaticProps } from "../../util/locales";

export default Farms;
