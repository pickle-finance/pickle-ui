import { FC } from "react";

export interface PickleFinancePage extends FC {
  PageTitle: FC;
}

export interface Farm {
  asset: string;
  iconSrc: string;
  earned: number;
  deposited: number;
  apy: string;
  liquidity: number;
}
