import { FC, useEffect } from "react";
import type { AppProps } from "next/app";
import { GeistProvider } from "@geist-ui/react";

import { geistTheme } from "../v1/styles/geistTheme";
import { Balances } from "../v1/containers/Balances";
import { ERC20Transfer } from "../v1/containers/Erc20Transfer";
import { Connection } from "../v1/containers/Connection";
import { Contracts } from "../v1/containers/Contracts";
import { Prices } from "../v1/containers/Prices";
import { Pickles, MiniPickles } from "../v1/containers/Pickles";
import { PickleStaking } from "../v1/containers/PickleStaking";
import { Farms } from "../v1/containers/Farms";
import { Jars } from "../v1/containers/Jars";
import { UniV2Pairs } from "../v1/containers/UniV2Pairs";
import { CurvePairs } from "../v1/containers/CurvePairs";
import { UserFarms } from "../v1/containers/UserFarms";
import { UserMiniFarms } from "../v1/containers/UserMiniFarms";
import { SushiPairs } from "../v1/containers/SushiPairs";
import { Dill } from "../v1/containers/Dill";
import { Gauges } from "../v1/containers/Gauges";
import { MiniFarms } from "../v1/containers/MiniFarms";
import { UserGauges } from "../v1/containers/UserGauges";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { ComethPairs } from "../v1/containers/ComethPairs";
import { TopBar } from "../v1/features/TopBar/TopBar";
import { PickleCore } from "v1/containers/Jars/usePickleCore";
import V2LinkCard from "v1/components/V2LinkCard";

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
        <V2LinkCard />
        <Component {...pageProps} />
      </WithContainers>
    </GeistProvider>
  );
};

export default Classic;
