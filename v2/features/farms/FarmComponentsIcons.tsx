import { FC } from "react";
import Image from "next/image";

import { JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";
import { classNames } from "v2/utils";
import { brandColor } from "./colors";

interface Props {
  jar: JarDefinition;
}

const TokenIcons: FC<Props> = ({ jar }) => {
  const { components } = jar.depositToken;

  if (!components) return null;

  return (
    <>
      {components.map((component, index) => (
        <div
          key={component}
          className={classNames(
            "image w-10 h-10 rounded-full border-3 border-gray-outline z-10 hover:scale-125 duration-200 hover:z-50",
            /**
             * Allow me, dear reader, to ask you not to dismiss this code as something
             * written by a complete idiot, "clean it up", and ultimately break it.
             * Tailwind will remove any unused classes in production and unless the classes
             * are used explicitly in the code, they will get purged. Hence, we can't build
             * these classes dynamically. We assume no more than 4 components per farm.
             */
            index === 0 && "z-40",
            index === 1 && "z-30",
            index === 2 && "z-20",
            index === 3 && "z-10",
            index > 0 && "-ml-4",
            index === components.length - 1 && "mr-3",
          )}
          style={{ background: brandColor(component) }}
        >
          <Image
            src={`/tokens/${component}.png`}
            className="rounded-full"
            width={50}
            height={50}
            layout="intrinsic"
            alt={component.toUpperCase()}
            title={component.toUpperCase()}
          />
        </div>
      ))}
    </>
  );
};

const FarmComponentsIcons: FC<Props> = ({ jar }) => {
  const { protocol } = jar;
  const sanitizedProtocolName = protocol.replace(/\s/g, "").toLowerCase();

  return (
    <div className="flex relative mr-2">
      <TokenIcons jar={jar} />
      <div
        className="absolute -top-3 -right-3 z-50 w-7 h-7 rounded-full border-3 border-gray-outline -ml-3 mr-3 opacity-0 scale-50 group-hover:scale-100 group-hover:opacity-100 duration-200"
        style={{ background: brandColor(sanitizedProtocolName) }}
      >
        <Image
          src={`/protocols/${sanitizedProtocolName}.png`}
          className="rounded-full"
          width={28}
          height={28}
          layout="intrinsic"
          alt={protocol}
          title={protocol}
        />
      </div>
    </div>
  );
};

export default FarmComponentsIcons;
