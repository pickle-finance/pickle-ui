import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { useRouter } from "next/router";
import { ChainNetwork } from "picklefinance-core";

import { useAppSelector } from "v2/store";
import { CoreSelectors } from "v2/store/core";

export const useNeedsNetworkSwitch = (assetChain: ChainNetwork) => {
  const { chainId } = useWeb3React<Web3Provider>();
  const networks = useAppSelector(CoreSelectors.selectNetworks);
  const network = networks?.find((item) => item.name === assetChain);
  const activeNetwork = networks?.find((network) => network.chainId === chainId);
  const needsNetworkSwitch = assetChain !== activeNetwork?.name;

  return { network, needsNetworkSwitch };
};

export const useAccount = () => {
  const { account } = useWeb3React<Web3Provider>();

  // This helps us debug issues by passing in user address to the URL.
  const router = useRouter();
  const impersonatedUserAddress = router.query.debug as string;

  return impersonatedUserAddress || account;
};
