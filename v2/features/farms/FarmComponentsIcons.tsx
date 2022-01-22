import { FC } from "react";
import Image from "next/image";
import { JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";

interface Props {
  jar: JarDefinition;
}

const FarmComponentsIcons: FC<Props> = ({ jar }) => {
  const protocolSrc = `/protocols/${jar.protocol
    .replace(/\s/g, "")
    .toLowerCase()}.png`;

  return (
    <div className="flex relative mr-2">
      <div
        className="image w-10 h-10 rounded-full border-3 border-gray-outline z-10 hover:scale-125 duration-200 hover:z-50"
        // 70% opacity
        style={{ background: "#2975cab3" }}
      >
        <Image
          src="/usdc.png"
          className="rounded-full"
          width={200}
          height={200}
          layout="responsive"
          alt={jar.depositToken.name}
          title={"USDC"}
        />
      </div>
      <div
        className="image w-10 h-10 rounded-full border-3 border-gray-outline -ml-3 mr-3 hover:scale-125 duration-200 hover:z-50"
        style={{ background: "#627eeab3" }}
      >
        <Image
          src="/ethereum.svg"
          className="rounded-full"
          width={200}
          height={200}
          layout="responsive"
          alt={jar.depositToken.name}
          title={"ETH"}
        />
      </div>
      <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full border-3 border-gray-outline -ml-3 mr-3 opacity-0 scale-50 group-hover:scale-100 group-hover:opacity-100 duration-200">
        <Image
          src={protocolSrc}
          className="rounded-full"
          width={200}
          height={200}
          layout="responsive"
          alt={jar.protocol}
          title={"ETH"}
        />
      </div>
    </div>
  );
};

export default FarmComponentsIcons;
