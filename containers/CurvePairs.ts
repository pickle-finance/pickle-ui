import { createContainer } from "unstated-next";
import { formatEther } from "ethers/lib/utils";

import { Connection } from "./Connection";

import { Contract as MulticallContract } from "ethers-multicall";
import { Contracts } from "./Contracts";

function useCurvePairs() {
  const { multicallProvider } = Connection.useContainer();
  const { alusdPool } = Contracts.useContainer();

  // don't return a function if it's not ready to be used
  if (!multicallProvider || !alusdPool) return { getAlusd3CrvData: null };

  const getAlusd3CrvData = async () => {
    const multicallPoolContract = new MulticallContract(
      alusdPool.address,
      alusdPool.interface.fragments,
    );

    const [pricePerToken] = (
      await multicallProvider.all([multicallPoolContract.get_virtual_price()])
    ).map((x) => parseFloat(formatEther(x)));

    return { pricePerToken };
  };

  return { getAlusd3CrvData };
}

export const CurvePairs = createContainer(useCurvePairs);
