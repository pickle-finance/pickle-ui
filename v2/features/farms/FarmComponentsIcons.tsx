import { FC, useState } from "react";
import Image from "next/image";

import { JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";
import { classNames } from "v2/utils";
import { brandColor, defaultBackgroundColor } from "./colors";

interface TokenIconProps {
  component: string;
  index: number;
  isLast: boolean;
}

interface ProtocolIconProps {
  protocol: string;
}

interface Props {
  jar: JarDefinition;
}

/**
 * Icons have an internal state which tells us if the image is fully loaded.
 * This allows us to render a vivid color as placeholder, then render a muted
 * default color that works well for transparent images.
 */
const TokenIcon: FC<TokenIconProps> = ({ component, index, isLast }) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  return (
    <div
      className={classNames(
        "w-10 h-10 rounded-full border-3 border-foreground-alt-400 z-10 hover:scale-125 duration-200 hover:z-50",
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
        isLast && "mr-3",
      )}
      style={{
        background: isLoaded ? defaultBackgroundColor : brandColor(component),
      }}
    >
      <Image
        src={`/tokens/${component}.png`}
        className="rounded-full"
        width={40}
        height={40}
        layout="intrinsic"
        alt={component.toUpperCase()}
        title={component.toUpperCase()}
        onLoadingComplete={() => setIsLoaded(true)}
      />
    </div>
  );
};

const ProtocolIcon: FC<ProtocolIconProps> = ({ protocol }) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const sanitizedProtocolName = protocol.replace(/\s/g, "").toLowerCase();

  return (
    <div
      className="absolute -top-3 -right-3 z-50 w-7 h-7 rounded-full border-3 border-foreground-alt-400 -ml-3 mr-3 opacity-0 scale-50 group-hover:scale-100 group-hover:opacity-100 duration-200"
      style={{
        background: isLoaded
          ? defaultBackgroundColor
          : brandColor(sanitizedProtocolName),
      }}
    >
      <Image
        src={`/protocols/${sanitizedProtocolName}.png`}
        className="rounded-full"
        width={28}
        height={28}
        layout="intrinsic"
        alt={protocol}
        title={protocol}
        onLoadingComplete={() => setIsLoaded(true)}
      />
    </div>
  );
};

const TokenIcons: FC<Props> = ({ jar }) => {
  const { components } = jar.depositToken;

  if (!components) return null;

  return (
    <>
      {components.map((component, index) => (
        <TokenIcon
          key={component}
          component={component}
          index={index}
          isLast={index === components.length - 1}
        />
      ))}
    </>
  );
};

const FarmComponentsIcons: FC<Props> = ({ jar }) => {
  const { protocol } = jar;

  return (
    <div className="flex relative mr-2">
      <TokenIcons jar={jar} />
      <ProtocolIcon protocol={protocol} />
    </div>
  );
};

export default FarmComponentsIcons;
