import { createContainer } from "unstated-next";
import { formatEther } from "ethers/lib/utils";

import { Connection } from "./Connection";

import { Contract as MulticallContract } from "ethers-multicall";
import CurvePoolABI from "./ABIs/pool.json";

function useCurvePairs() {
  const { multicallProvider } = Connection.useContainer();

  // don't return a function if it's not ready to be used
  if (!multicallProvider) return { getCurveLpPriceData: null };

  const getCurveLpPriceData = async (tokenAddress: string) => {
    const multicallPoolContract = new MulticallContract(tokenAddress, CurvePoolABI);

    const [pricePerToken] = (
      await multicallProvider.all([multicallPoolContract.get_virtual_price()])
    ).map((x) => parseFloat(formatEther(x)));

    return pricePerToken;
  };

  return { getCurveLpPriceData };
}

export const CurvePairs = createContainer(useCurvePairs);
