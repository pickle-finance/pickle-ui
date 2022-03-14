import { FC, useEffect } from "react";
import type { AppProps } from "next/app";
import { GeistProvider } from "@geist-ui/react";

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
import { TopBar } from "../features/TopBar/TopBar";
import { PickleCore } from "containers/Jars/usePickleCore";

const getLibrary = (provider: any) => {
  return new Web3Provider(provider);
};

const WithContainers: FC = ({ children }) => (
  <Web3ReactProvider getLibrary={getLibrary}>
    <PickleCore.Provider>
      <Connection.Provider>
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
                                        <UserFarms.Provider>
                                          <UserGauges.Provider>
                                            <UserMiniFarms.Provider>
                                              {children}
                                            </UserMiniFarms.Provider>
                                          </UserGauges.Provider>
                                        </UserFarms.Provider>
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
      </Connection.Provider>
    </PickleCore.Provider>
  </Web3ReactProvider>
);

const Classic: FC<AppProps> = ({ Component, pageProps }) => {
  useEffect(() => {
    document.querySelector("body")!.classList.add("classic");
  }, []);

  return (
    <GeistProvider theme={geistTheme}>
      <WithContainers>
        <TopBar />
        <Component {...pageProps} />
      </WithContainers>
    </GeistProvider>
  );
};

export default Classic;
