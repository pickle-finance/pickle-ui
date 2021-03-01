import { FC } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { GeistProvider } from "@geist-ui/react";
import * as types from "styled-components/cssprop";

import "../styles/reset.css";
import "../styles/global.scss";
import { geistTheme } from "../styles/geistTheme";
import { Balances } from "../containers/Balances";
import { ERC20Transfer } from "../containers/Erc20Transfer";
import { Connection } from "../containers/Connection";
import { Contracts } from "../containers/Contracts";
import { Prices } from "../containers/Prices";
import { Pickles } from "../containers/Pickles";
import { PickleStaking } from "../containers/PickleStaking";
import { Farms } from "../containers/Farms";
import { Jars } from "../containers/Jars";
import { UniV2Pairs } from "../containers/UniV2Pairs";
import { UserJars } from "../containers/UserJars";
import { UserFarms } from "../containers/UserFarms";
import { SushiPairs } from "../containers/SushiPairs";

const WithContainers: FC = ({ children }) => (
  <Connection.Provider>
    <Contracts.Provider>
      <Balances.Provider>
        <ERC20Transfer.Provider>
          <Prices.Provider>
            <Pickles.Provider>
              <PickleStaking.Provider>
                <UniV2Pairs.Provider>
                  <SushiPairs.Provider>
                    <Jars.Provider>
                      <Farms.Provider>
                        <UserJars.Provider>
                          <UserFarms.Provider>{children}</UserFarms.Provider>
                        </UserJars.Provider>
                      </Farms.Provider>
                    </Jars.Provider>
                  </SushiPairs.Provider>
                </UniV2Pairs.Provider>
              </PickleStaking.Provider>
            </Pickles.Provider>
          </Prices.Provider>
        </ERC20Transfer.Provider>
      </Balances.Provider>
    </Contracts.Provider>
  </Connection.Provider>
);

const App: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Pickle Interface</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&family=Source+Sans+Pro:wght@300&family=VT323&display=swap"
          rel="stylesheet"
        />

        <script 
          async 
          src="https://www.googletagmanager.com/gtag/js?id=G-R1CT5KTZCB">
        ></script>

        <script
          dangerouslySetInnerHTML={{
            __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());

                    gtag('config', 'G-R1CT5KTZCB', {
                      page_path: window.location.pathname,
                    });
                  `,
          }}
        />
        <meta property="og:title" content="Farm PICKLE tokens" />
        <meta
          property="og:description"
          content="The future of finance is green"
        />
        <meta property="og:image" content="https://i.imgur.com/N23Hjh0.png" />
        <meta property="og:url" content="https://app.pickle.finance" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <GeistProvider theme={geistTheme}>
        <WithContainers>
          <Component {...pageProps} />
        </WithContainers>
      </GeistProvider>
    </>
  );
};

export default App;
