import { useTranslation } from "next-i18next";
import { useEffect } from "react";

const useTranslationsHMR = () => {
  const { i18n } = useTranslation();

  if (process.env.NODE_ENV === "development" && !process.browser && i18n.options) {
    import("i18next-hmr/server").then(({ applyServerHMR }) => {
      applyServerHMR(i18n);
    });
  }

  useEffect(() => {
    if (process.env.NODE_ENV === "development" && i18n.options) {
      import("i18next-hmr/client").then(({ applyClientHMR }) => {
        applyClientHMR(i18n);
      });
    }
  }, [i18n]);
};

export default useTranslationsHMR;
