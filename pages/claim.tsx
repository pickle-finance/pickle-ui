import { FC } from "react";
import { GetStaticPropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

import Claim from "v2/features/claim";

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common"])),
    },
  };
}

const PageTitle: FC = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <h1 className="font-title font-medium min-w-200 text-2xl sm:text-3xl pt-2">
        {t("v2.nav.claim")}
      </h1>
      <h2 className="font-body font-normal min-w-300 text-foreground-alt-200 text-sm sm:text-base leading-4 sm:leading-6 mt-1">
        Pickle Finance is sunsetting. PICKLE and DILL holders can claim USDC from the treasury.{" "}
      </h2>
    </>
  );
};

Claim.PageTitle = PageTitle;

export default Claim;
