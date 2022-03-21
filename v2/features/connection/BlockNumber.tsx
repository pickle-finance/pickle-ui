import { FC, useEffect, useState } from "react";
import { CubeIcon } from "@heroicons/react/solid";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

const BlockNumber: FC = () => {
  const { library } = useWeb3React<Web3Provider>();
  const [blockNumber, setBlockNumber] = useState<number>();

  useEffect(() => {
    if (library) {
      library.on("block", setBlockNumber);
      return () => {
        library.removeAllListeners("block");
      };
    }
  }, [library]);

  if (!blockNumber) return null;

  return (
    <div className="flex text-foreground-alt-300 text-sm">
      <CubeIcon className="w-5 h-5 text-foreground-alt-300 text mr-2" />
      {blockNumber}
    </div>
  );
};

export default BlockNumber;
