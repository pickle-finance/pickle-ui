import { FC } from "react";
import { useTranslation } from "next-i18next";

const RevHead: FC = () => {
  const { t } = useTranslation("common");
  return (
    <thead className="rounded-t-md">
      <tr className="w-full border border-foreground-alt-400 bg-slate-600">
        <th scope="col" className="w-1/3 pt-2 pb-2">
          {t("v2.stats.jar.revsTableHeaders.date")}
        </th>
        <th scope="col" className="w-1/3 pt-2 pb-2">
          {t("v2.stats.jar.revsTableHeaders.txLink")}
        </th>
        <th scope="col" className="w-1/3 pt-2 pb-2">
          {t("v2.stats.jar.revsTableHeaders.value")}
        </th>
      </tr>
    </thead>
  );
};

export default RevHead;
