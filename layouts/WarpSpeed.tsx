import { FC, useEffect } from "react";
import type { AppProps } from "next/app";

const WarpSpeed: FC<AppProps> = ({ Component, pageProps }) => {
  useEffect(() => {
    document.querySelector("body")!.classList.add("warp-speed");
  }, []);

  return <Component {...pageProps} />;
};

export default WarpSpeed;
