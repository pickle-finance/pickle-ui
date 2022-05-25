import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { ChainNetwork, Chains } from "picklefinance-core/lib/chain/Chains";

const useENS = (address: string | undefined) => {
  const [ensName, setENSName] = useState<string | null>(null);
  const rpc = Chains.get(ChainNetwork.Ethereum).rpcProviderUrls[0];
  const provider = new ethers.providers.JsonRpcProvider(rpc);

  useEffect(() => {
    const resolveENS = async () => {
      if (ethers.utils.isAddress(address) && provider) {
        let ensName = await provider.lookupAddress(address!);
        if (ensName) {
          setENSName(ensName);
        } else {
          setENSName(null);
        }
      }
    };
    resolveENS();
  }, [address]);

  return { ensName };
};

export default useENS;
