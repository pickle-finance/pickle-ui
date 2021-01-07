import { useState, useEffect } from "react";

import { UserJarData } from "../../containers/UserJars";

import { Jars } from "../../containers/Jars";
import { Balances } from "../../containers/Balances";
import { Connection } from "../../containers/Connection";
import { ERC20Transfer } from "../../containers/Erc20Transfer";

export const useJarData = (): { jarData: UserJarData[] | null } => {
  const { blockNum } = Connection.useContainer();
  const { jars } = Jars.useContainer();
  const { tokenBalances, getBalance } = Balances.useContainer();
  const { status: transferStatus } = ERC20Transfer.useContainer();

  const [jarData, setJarData] = useState<Array<UserJarData> | null>(null);

  const updateJarData = async () => {
    if (jars) {
      const promises = jars?.map(async (jar) => {
        const balance = await getBalance(jar.depositToken.address);
        const deposited = await getBalance(jar.contract.address);

        return {
          name: jar.jarName,
          jarContract: jar.contract,
          depositToken: jar.depositToken,
          depositTokenName: jar.depositTokenName,
          ratio: jar.ratio || 0,
          balance: balance || 0,
          deposited: deposited || 0,
          usdPerPToken: jar.usdPerPToken || 0,
          APYs: jar.APYs,
          totalAPY: jar.totalAPY,
          depositTokenLink: jar.depositTokenLink,
        };
      });

      const newJarData = await Promise.all(promises);

      setJarData(newJarData);
    }
  };

  useEffect(() => {
    updateJarData();
  }, [jars, blockNum, tokenBalances, transferStatus]);

  return { jarData };
};
