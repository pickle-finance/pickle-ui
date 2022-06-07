import { FC } from "react";
import { Spacer } from "@geist-ui/react";

import { Balances } from "./Balances";
import { Interaction } from "./Interaction";
import { Claim } from "./Claim";
import { CalcCollapsible } from "./CalcCollapsible";
import { FeeDistributionsChart } from "./FeeDistributionsChart";
import { Dill } from "../../containers/Dill";

export const DillFeature: FC = () => {
  const dillStats = Dill.useContainer();

  return (
    <>
      <Spacer />
      <Balances dillStats={dillStats} />
      <Spacer />
      <FeeDistributionsChart />
      <Spacer />
      <Interaction dillStats={dillStats} />
      <Spacer />
      <Claim dillStats={dillStats} />
      <Spacer />
      <CalcCollapsible dillStats={dillStats} />
    </>
  );
};
