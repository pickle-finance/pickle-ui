import { FC } from "react";

export interface PickleFinancePage extends FC {
  PageTitle: FC;
}

export interface JarDetails {
  name: string;
  chain: string;
  apy: number;
}
