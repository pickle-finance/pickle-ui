import { ethers } from "ethers";
import { useEffect, useState } from "react";

const useENS = (address: string) => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.infura);
  const [ensName, setENSName] = useState<string | null>(null);

  useEffect(() => {
    const resolveENS = async () => {
      if (ethers.utils.isAddress(address)) {
        let ensName = await provider.lookupAddress(address);
        setENSName(ensName);
      }
    };
    resolveENS();
  }, [address]);

  return { ensName };
};

export default useENS;
