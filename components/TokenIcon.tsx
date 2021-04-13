import React, { ReactNode } from "react";

export const LpIcon = ({
  swapIconSrc,
  tokenIconSrc,
  className,
  size,
}: {
  swapIconSrc: string;
  tokenIconSrc: string;
  className?: string;
  size?: string;
}) => {
  return (
    <div className={className} css={{ position: "relative" }}>
      <img src={swapIconSrc} css={{ width: `${size === "sm" ? 30 : 50}px` }} />
      <img
        src={tokenIconSrc}
        css={{
          position: "absolute",
          right: -4,
          bottom: -1,
          width: `${size === "sm" ? 15 : 25}px`,
          borderRadius: "100%",
        }}
      />
    </div>
  );
};

export const TokenIcon = ({
  src,
  size,
}: {
  src: string | ReactNode;
  size?: string;
}) => (
  <div
    style={{
      float: "left",
      margin: "auto 0",
      marginRight: size === "sm" ? 10 : "1rem",
      minHeight: 0,
      display: "flex",
    }}
  >
    {typeof src === "string" ? (
      <img src={src} css={{ width: `${size === "sm" ? 30 : 50}px` }} />
    ) : (
      React.cloneElement(src, { size: size })
    )}
  </div>
);
