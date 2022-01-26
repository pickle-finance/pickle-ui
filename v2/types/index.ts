import { RawChain } from "picklefinance-core/lib/chain/Chains";
import { FC } from "react";

export interface PickleFinancePage extends FC {
  PageTitle: FC;
}

export interface JarDetails {
  name: string;
  apiKey?: string;
  chain: string;
  apy: number;
}
