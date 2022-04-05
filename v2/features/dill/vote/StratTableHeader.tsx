import { FC, HTMLAttributes } from "react";
import { useTranslation } from "next-i18next";

const StratTableHeader: FC<{}> = () => {
  const { t } = useTranslation("common");
  return (
    <thead className="bg-background uppercase">
      <tr>
        <HeaderCell>
          <p className="text-left">{t("v2.dill.vote.stratName")}</p>
        </HeaderCell>

        <HeaderCell>
          <p className="text-center">{t("v2.dill.vote.yourVote")}</p>
        </HeaderCell>

        <HeaderCell>
          <p className="text-center">{t("v2.dill.vote.newVote")}</p>
        </HeaderCell>
      </tr>
    </thead>
  );
};

const HeaderCell: FC<HTMLAttributes<HTMLElement>> = ({ children }) => (
  <th
    scope="col"
    className="px-4 py-1 h-8 text-xs font-bold text-foreground-alt-200 tracking-normal sm:px-6"
  >
    {children}
  </th>
);

export default StratTableHeader;
