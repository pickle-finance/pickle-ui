import { FC } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { appWithTranslation, useTranslation } from "next-i18next";

/**
 * Global CSS must be in _app.tsx.
 * https://nextjs.org/docs/messages/css-global
 */
import "../styles/reset.css";
import "../styles/global.scss";
import "react-day-picker/lib/style.css";

/**
 * Warp speed styles: Tailwind and custom rules.
 */
import "v2/styles/index.scss";

import Classic from "../layouts/Classic";
import WarpSpeed from "../layouts/WarpSpeed";

// i18n
import useTranslationsHMR from "../hooks/useTranslationsHMR";
import config from "../next-i18next.config";

const Body: FC<AppProps> = (props) => {
  if (props.router.pathname.startsWith("/v2")) {
    return <WarpSpeed {...props} />;
  }

  return <Classic {...props} />;
};

const App: FC<AppProps> = (props) => {
  useTranslationsHMR();

  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{t("meta.titleFull")}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-R1CT5KTZCB"
        ></script>

        <meta property="og:title" content={t("meta.titleFull")} />
        <meta property="og:description" content={t("meta.description")} />
        <meta property="og:image" content="https://i.imgur.com/avQP3n2.jpg" />
        <meta property="og:url" content="https://app.pickle.finance" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Body {...props} />
    </>
  );
};

export default appWithTranslation(App, config);
