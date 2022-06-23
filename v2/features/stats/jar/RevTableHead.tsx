import { FC } from "react";
import { useTranslation } from "next-i18next";

const RevHead: FC = () => {
  const { t } = useTranslation("common");
  return (
    <thead className="rounded-t-md">
      <tr className="w-full border border-foreground-alt-400 bg-slate-600">
        <th
          scope="col"
          className="text-left text-foreground-alt-200 xl:pl-20 lg:pl-20 md:pl-10 sm:pl-10 py-2 pr-2"
        >
          {t("v2.stats.jar.revsTableHeaders.date")}
        </th>
        <th scope="col" className="text-left text-foreground-alt-200 p-2">
          {t("v2.stats.jar.revsTableHeaders.txLink")}
        </th>
        <th scope="col" className="text-left text-foreground-alt-200 p-2">
          {t("v2.stats.jar.revsTableHeaders.value")}
        </th>
      </tr>
    </thead>
  );
};

export default RevHead;
