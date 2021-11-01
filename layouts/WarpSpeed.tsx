import { FC } from "react";
import type { AppProps } from "next/app";

const WarpSpeed: FC<AppProps> = ({ Component, pageProps }) => (
  <Component {...pageProps} />
);

export default WarpSpeed;
