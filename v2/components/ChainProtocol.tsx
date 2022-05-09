import Image from "next/image";
import { PickleAsset } from "picklefinance-core/lib/model/PickleModelJson";
import { VFC } from "react";

import { Network } from "v2/features/connection/networks";
import { formatImagePath } from "v2/features/farms/flows/utils";

const ChainProtocol: VFC<{ asset: PickleAsset; networks: Network[] | undefined }> = ({
  asset,
  networks,
}) => {
  return (
    <div>
      <p className="font-title font-medium text-base leading-5 group-hover:text-primary-light transition duration-300 ease-in-out">
        {asset.depositToken.name}
      </p>
      <div className="flex mt-1">
        <div className="w-4 h-4 mr-1">
          <Image
            src={formatImagePath(asset.chain, networks)}
            className="rounded-full"
            width={20}
            height={20}
            layout="responsive"
            alt={asset.chain}
            title={asset.chain}
          />
        </div>
        <p className="italic font-normal text-xs text-foreground-alt-200">{asset.protocol}</p>
      </div>
    </div>
  );
};

export default ChainProtocol;
