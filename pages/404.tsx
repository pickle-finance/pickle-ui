import type { PickleFinancePage } from "v2/types";
import { FC } from "react";
import { useTranslation } from "next-i18next";

const NotFound: PickleFinancePage = () => {
  const { t } = useTranslation("common");

  return (
    <div className="flex justify-center items-center py-8 lg:py-32">
      <div className="bg-background-light w-4/5 lg:w-1/2 max-w-xl rounded-xl border border-foreground-alt-500 shadow p-6 md:p-12">
        <div className="flex justify-center mt-2">
          <div className="w-3/5 lg:w-1/2 min-h-[200px]">
            <img src="/animations/failure.gif" />
          </div>
        </div>
        <div className="w-full text-center mb-8">
          <p className="break-normal font-bold text-foreground-alt-200">
            {t("v2.error404.noPickles")}
          </p>
        </div>
        <div className="w-full text-center mb-8">
          <p className="break-normal text-foreground-alt-200">{t("v2.error404.errorMessage")}</p>
        </div>
      </div>
    </div>
  );
};

const PageTitle: FC = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <h1 className="font-title font-medium text-2xl sm:text-3xl pt-2">404 Error</h1>
      <h2 className="font-body font-normal text-foreground-alt-200 text-sm sm:text-base leading-4 sm:leading-6 mt-1">
        Page Not Found
      </h2>
    </>
  );
};

NotFound.PageTitle = PageTitle;

export { getStaticProps } from "v1/util/locales";

export default NotFound;
