import { FC } from "react";
import { useTranslation } from "next-i18next";

const RevHead: FC = () => {
  const { t } = useTranslation("common");
  return (
    <thead className="rounded-t-md">
      <tr className="w-full border border-foreground-alt-400 bg-slate-600">
        <th scope="col" className="text-left xl:pl-20 lg:pl-20 md:pl-10 sm:pl-10 pt-2 pb-2">
          {t("v2.stats.jar.revsTableHeaders.date")}
        </th>
        <th scope="col" className="text-left p-2">
          {t("v2.stats.jar.revsTableHeaders.txLink")}
        </th>
        <th scope="col" className="text-left p-2">
          {t("v2.stats.jar.revsTableHeaders.value")}
        </th>
      </tr>
    </thead>
  );
};

export default RevHead;
