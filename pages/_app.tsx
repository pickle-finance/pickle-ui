import { FC, useEffect } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { appWithTranslation, useTranslation } from "next-i18next";
import { CacheProvider, EmotionCache } from '@emotion/react';

/**
 * Global CSS must be in _app.tsx.
 * https://nextjs.org/docs/messages/css-global
 *
 * v2 styles: Tailwind and custom rules.
 */
import "v2/styles/index.scss";
import "react-day-picker/lib/style.css";

// Legacy v1 styles
import "v1/styles/reset.css";
import "v1/styles/global.scss";

import Classic from "../layouts/Classic";
import WarpSpeed from "../layouts/WarpSpeed";

// i18n
import useTranslationsHMR from "../v1/hooks/useTranslationsHMR";
import config from "../next-i18next.config";
import Script from "next/script";
import createEmotionCache from "./createEmotionCache";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

export interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

const Body: FC<AppProps> = (props) => {
  if (props.router.pathname.startsWith("/v1")) {
    return <Classic {...props} />;
  }

  return <WarpSpeed {...props} />;
};

const App: FC<MyAppProps> = (props) => {
  const { emotionCache = clientSideEmotionCache } = props;
  useTranslationsHMR();

  const { t } = useTranslation("common");

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles?.parentElement?.removeChild(jssStyles);
    }
  }, []);

  return (
    <>
      <CacheProvider value={emotionCache}>
        <Head>
          <title>{t("meta.titleFull")}</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
          <meta property="og:title" content={t("meta.titleFull") as string} />
          <meta property="og:description" content={t("meta.description") as string} />
          <meta property="og:image" content="https://i.imgur.com/avQP3n2.jpg" />
          <meta property="og:url" content="https://app.pickle.finance" />
          <meta name="twitter:card" content="summary_large_image" />
        </Head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-R1CT5KTZCB"
          strategy="afterInteractive"
        />
        <Body {...props} />
      </CacheProvider>
    </>
  );
};

export default appWithTranslation(App, config);
