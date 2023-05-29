import Document, {
  DocumentContext,
  DocumentInitialProps,
  Html,
  Head,
  Main,
  NextScript,
} from "next/document";
import { ServerStyleSheets as JSSServerStyleSheets } from '@mui/styles';
import createEmotionServer from '@emotion/server/create-instance';
import createEmotionCache from './createEmotionCache';
import React from "react";

// You can find a benchmark of the available CSS minifiers under
// https://github.com/GoalSmashers/css-minification-benchmark
// We have found that clean-css is faster than cssnano but the output is larger.
// Waiting for https://github.com/cssinjs/jss/issues/279
// 4% slower but 12% smaller output than doing it in a single step.
//
// It's using .browserslistrc
let prefixer: any;
let cleanCSS: any;
if (process.env.NODE_ENV === 'production') {
  /* eslint-disable global-require */
  const postcss = require('postcss');
  const autoprefixer = require('autoprefixer');
  const CleanCSS = require('clean-css');
  /* eslint-enable global-require */

  prefixer = postcss([autoprefixer]);
  cleanCSS = new CleanCSS();
}

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    const originalRenderPage = ctx.renderPage;

    // You can consider sharing the same emotion cache between all the SSR requests to speed up performance.
    // However, be aware that it can have global side effects.
    const cache = createEmotionCache();
    const { extractCriticalToChunks } = createEmotionServer(cache);
    const jssSheets = new JSSServerStyleSheets();


    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App) => (props) => jssSheets.collect(<App {...props} />),
      });

    const initialProps = await Document.getInitialProps(ctx);

    // Generate style tags for the styles coming from Emotion
    // This is important. It prevents Emotion from rendering invalid HTML.
    // See https://github.com/mui/material-ui/issues/26561#issuecomment-855286153
    const emotionStyles = extractCriticalToChunks(initialProps.html);
    const emotionStyleTags = emotionStyles.styles.map((style) => (
      <style
        data-emotion={`${style.key} ${style.ids.join(' ')}`}
        key={style.key}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: style.css }}
      />
    ));

    // Generate the css string for the styles coming from jss
    let css = jssSheets.toString();
    // It might be undefined, e.g. after an error.
    if (css && process.env.NODE_ENV === 'production') {
      const result1 = await prefixer.process(css, { from: undefined });
      css = result1.css;
      css = cleanCSS.minify(css).styles;
    }

    return {
      ...initialProps,
      styles: [
        ...emotionStyleTags,
        <style
          id="jss-server-side"
          key="jss-server-side"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: css }}
        />,
        ...React.Children.toArray(initialProps.styles),
      ],
    };
  }

  render() {
    return (
      <Html className="h-full">
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&family=Source+Sans+Pro:wght@300&family=VT323&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Poppins:wght@500&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body className="h-full font-body bg-background">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
