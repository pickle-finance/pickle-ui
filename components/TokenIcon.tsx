import React, { ReactNode } from "react";

export const LpIcon = ({
  swapIconSrc,
  tokenIconSrc,
  className,
}: {
  swapIconSrc: string;
  tokenIconSrc: string;
  className?: string;
}) => {
  return (
    <div className={className} css={{ position: "relative" }}>
      <img src={swapIconSrc} css={{ width: `50px` }} />
      <img
        src={tokenIconSrc}
        css={{
          position: "absolute",
          right: -3,
          bottom: -3,
          width: `25px`,
          borderRadius: "100%",
        }}
      />
    </div>
  );
};

export const MiniIcon = ({ size = "16px", source }) => (
  <img
    src={source}
    alt="pickle"
    style={{
      width: size,
      verticalAlign: `text-bottom`,
    }}
  />
);

export const TokenIcon = ({ src }: { src: string | ReactNode }) => (
  <div
    style={{
      float: "left",
      margin: "auto 0",
      marginRight: "1rem",
      minHeight: 0,
      display: "flex",
    }}
  >
    {typeof src === "string" ? <img src={src} css={{ width: `50px` }} /> : src}
  </div>
);
