import { Connection } from "v1/containers/Connection";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

const useENS = (address: string) => {
  const { provider } = Connection.useContainer();
  const [ensName, setENSName] = useState<string | null>(null);

  useEffect(() => {
    const resolveENS = async () => {
      if (ethers.utils.isAddress(address)) {
        let ensName = await provider.lookupAddress(address);
        if (ensName) setENSName(ensName);
      }
    };
    resolveENS();
  }, [address]);

  return { ensName };
};

export default useENS;
