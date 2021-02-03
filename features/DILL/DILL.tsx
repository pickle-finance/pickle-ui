import { FC } from "react";
import { Spacer } from "@geist-ui/react";

import { Balances } from "./Balances";
import { Interaction } from "./Interaction";
import { Dill } from "../../containers/Dill";

export const DillFeature: FC = () => {
  const dillStats = Dill.useContainer();

  return (
    <>
      <Spacer />
      <Balances dillStats={dillStats} />
      <Spacer />
      <Interaction dillStats={dillStats} />
    </>
  );
};
