import { useTranslation } from "next-i18next";
import { FC } from "react";

const BigMoverTableHead: FC<{colB: string}> = ({colB}) => {
  const { t } = useTranslation("common");
  return (
    <thead className="rounded-t-md">
      <tr className="w-full border border-foreground-alt-400 bg-foreground-alt-400">
        <th scope="col" className="w-1/2 pt-2 pb-2">
          {t("v2.stats.chain.bigMoversTableHeader.asset")}
        </th>
        <th scope="col" className="w-1/3 pt-2 pb-2">
          {t(colB)}
        </th>
      </tr>
    </thead>
  );
};

export default BigMoverTableHead;
