import { GetStaticPropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => {
  const locales = await serverSideTranslations(locale!, ["common"]);

  return {
    props: {
      ...locales,
    },
  };
};
