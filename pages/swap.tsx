import { FC } from "react";
import { useTranslation } from "next-i18next";
import SwapMainCard from "v2/features/swap/SwapMainCard";

const Swap = () => {
  const { t } = useTranslation("common");

  return <SwapMainCard />;
};

const PageTitle: FC = () => {
  const { t } = useTranslation("common");

  return <h1 className="font-title font-medium text-2xl sm:text-3xl pt-2">{t("v2.nav.swap")}</h1>;
};

Swap.PageTitle = PageTitle;

export { getStaticProps } from "v1/util/locales";

export default Swap;
