import { FC } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { GeistProvider } from "@geist-ui/react";
import { appWithTranslation } from "next-i18next";

import "../styles/reset.css";
import "../styles/global.scss";
import "react-day-picker/lib/style.css";

import { geistTheme } from "../styles/geistTheme";
import { Balances } from "../containers/Balances";
import { ERC20Transfer } from "../containers/Erc20Transfer";
import { Connection } from "../containers/Connection";
import { Contracts } from "../containers/Contracts";
import { Prices } from "../containers/Prices";
import { Pickles, MiniPickles } from "../containers/Pickles";
import { PickleStaking } from "../containers/PickleStaking";
import { Farms } from "../containers/Farms";
import { Jars } from "../containers/Jars";
import { UniV2Pairs } from "../containers/UniV2Pairs";
import { CurvePairs } from "../containers/CurvePairs";
import { UserJars } from "../containers/UserJars";
import { UserFarms } from "../containers/UserFarms";
import { UserMiniFarms } from "../containers/UserMiniFarms";
import { SushiPairs } from "../containers/SushiPairs";
import { Dill } from "../containers/Dill";
import { Gauges } from "../containers/Gauges";
import { MiniFarms } from "../containers/MiniFarms";
import { UserGauges } from "../containers/UserGauges";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { ComethPairs } from "../containers/ComethPairs";
import { PoolData } from "../containers/Jars/usePoolData";
import { TopBar } from "../features/TopBar/TopBar";

// i18n
import useTranslationsHMR from "../hooks/useTranslationsHMR";
import config from "../next-i18next.config";

const getLibrary = (provider: any) => {
  return new Web3Provider(provider);
};

const WithContainers: FC = ({ children }) => (
  <Web3ReactProvider getLibrary={getLibrary}>
    <Connection.Provider>
      <PoolData.Provider>
        <Contracts.Provider>
          <Balances.Provider>
            <ERC20Transfer.Provider>
              <Prices.Provider>
                <Pickles.Provider>
                  <MiniPickles.Provider>
                    <PickleStaking.Provider>
                      <CurvePairs.Provider>
                        <UniV2Pairs.Provider>
                          <ComethPairs.Provider>
                            <Dill.Provider>
                              <SushiPairs.Provider>
                                <Jars.Provider>
                                  <Farms.Provider>
                                    <Gauges.Provider>
                                      <MiniFarms.Provider>
                                        <UserJars.Provider>
                                          <UserFarms.Provider>
                                            <UserGauges.Provider>
                                              <UserMiniFarms.Provider>
                                                {children}
                                              </UserMiniFarms.Provider>
                                            </UserGauges.Provider>
                                          </UserFarms.Provider>
                                        </UserJars.Provider>
                                      </MiniFarms.Provider>
                                    </Gauges.Provider>
                                  </Farms.Provider>
                                </Jars.Provider>
                              </SushiPairs.Provider>
                            </Dill.Provider>
                          </ComethPairs.Provider>
                        </UniV2Pairs.Provider>
                      </CurvePairs.Provider>
                    </PickleStaking.Provider>
                  </MiniPickles.Provider>
                </Pickles.Provider>
              </Prices.Provider>
            </ERC20Transfer.Provider>
          </Balances.Provider>
        </Contracts.Provider>
      </PoolData.Provider>
    </Connection.Provider>
  </Web3ReactProvider>
);

const App: FC<AppProps> = ({ Component, pageProps }) => {
  useTranslationsHMR();

  return (
    <>
      <Head>
        <title>Pickle Interface</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-R1CT5KTZCB"
        ></script>

        <meta property="og:title" content="Optimize your yield" />
        <meta
          property="og:description"
          content="The future of finance is green"
        />
        <meta property="og:image" content="https://i.imgur.com/avQP3n2.jpg" />
        <meta property="og:url" content="https://app.pickle.finance" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <GeistProvider theme={geistTheme}>
        <WithContainers>
          <TopBar />
          <Component {...pageProps} />
        </WithContainers>
      </GeistProvider>
    </>
  );
};

export default appWithTranslation(App, config);
