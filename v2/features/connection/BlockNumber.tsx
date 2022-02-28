import { FC } from "react";
import { useSelector } from "react-redux";
import { CubeIcon } from "@heroicons/react/solid";

import { ConnectionSelectors } from "v2/store/connection";

const BlockNumber: FC = () => {
  const blockNumber = useSelector(ConnectionSelectors.selectBlockNumber);

  if (!blockNumber) return null;

  return (
    <div className="flex text-foreground-alt-300 text-sm">
      <CubeIcon className="w-5 h-5 text-foreground-alt-300 text mr-2" />
      {blockNumber}
    </div>
  );
};

export default BlockNumber;
