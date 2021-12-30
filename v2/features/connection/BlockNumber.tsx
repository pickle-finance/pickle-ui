import { FC } from "react";
import { useSelector } from "react-redux";
import { CubeIcon } from "@heroicons/react/solid";

import { ConnectionSelectors } from "v2/store/connection";

const BlockNumber: FC = () => {
  const blockNumber = useSelector(ConnectionSelectors.selectBlockNumber);

  if (!blockNumber) return null;

  return (
    <div className="flex justify-end bg-black text-gray-outline-light text-sm my-10">
      <CubeIcon className="w-5 h-5 text-gray-outline-light text mr-2" />
      {blockNumber}
    </div>
  );
};

export default BlockNumber;
