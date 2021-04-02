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
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

const getLibrary = (provider: any) => {
  return new Web3Provider(provider);
};

const WithContainers: FC = ({ children }) => (
  <Web3ReactProvider getLibrary={getLibrary}>
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
  </Web3ReactProvider>
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
          src="https://www.googletagmanager.com/gtag/js?id=G-R1CT5KTZCB"
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


                    >!function(w,d,i,s){function l(){if(!d.getElementById(i)){var f=d.getElementsByTagName(s)[0],e=d.createElement(s);e.type="text/javascript",e.async=!0,e.src="https://canny.io/sdk.js",f.parentNode.insertBefore(e,f)}}if("function"!=typeof w.Canny){var c=function(){c.q.push(arguments)};c.q=[],w.Canny=c,"complete"===d.readyState?l():w.attachEvent?w.attachEvent("onload",l):w.addEventListener("load",l,!1)}}(window,document,"canny-jssdk","script");

                    Canny('identify', {
                      appID: '603cf06a10aac45a5b355b04',
                      user: {
                        // Replace these values with the current user's data
                        email: user.email,
                        name: user.name,
                        id: user.id,

                        // These fields are optional, but recommended:
                        avatarURL: user.avatarURL,
                        created: new Date(user.created).toISOString(),
                      },
                    });

                    window.heap=window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};var r=document.createElement("script");r.type="text/javascript",r.async=!0,r.src="https://cdn.heapanalytics.com/js/heap-"+e+".js";var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(r,a);for(var n=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify","resetIdentity","removeEventProperty","setEventProperties","track","unsetEventProperty"],o=0;o<p.length;o++)heap[p[o]]=n(p[o])};   
                    heap.load("109300057");
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
