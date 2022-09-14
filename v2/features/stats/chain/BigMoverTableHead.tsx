import { useTranslation } from "next-i18next";
import { FC } from "react";

const BigMoverTableHead: FC<{ colB: string }> = ({ colB }) => {
  const { t } = useTranslation("common");
  return (
    <thead className="rounded-t-md min-w-min ">
      <tr className="w-full min-w-min text-foreground-alt-200 border border-foreground-alt-400 bg-foreground-alt-400">
        <th scope="col" className="text-left min-w-min pl-20 pt-2 pb-2">
          {t("v2.stats.chain.bigMoversTableHeader.asset")}
        </th>
        <th scope="col" className="text-left min-w-min pl-20 pt-2 pb-2">
          {t(colB)}
        </th>
      </tr>
    </thead>
  );
};

export default BigMoverTableHead;
