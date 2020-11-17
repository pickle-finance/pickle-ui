import { FC } from "react";
import { Card, Spacer } from "@geist-ui/react";
import { ExitToJar } from "./ExitToJar";
import { ExitToToken } from "./ExitToToken";

export const Withdraw: FC = () => {
  return (
    <Card>
      <h2>Withdraw</h2>
      <p>
        Withdrawal is a two-step process. First exit from farm to jar, and then
        from jar into the token of your choice.
      </p>
      <ExitToJar />
      <Spacer />
      <ExitToToken />
    </Card>
  );
};
