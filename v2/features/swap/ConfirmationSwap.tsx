import { OrderKind } from "@cowprotocol/cow-sdk";
import React, { FC } from "react";
import { ReadCurrencyInput } from "./ReadCurrencyInput";
import { SwapContainer } from "./style";
import { SwapInfo } from "./SwapInfo";
import { SwapSelect } from "./SwapSelector";
import { StyledButton } from "./style";

interface ConfirmationSwapProps {
  token1: SwapSelect | undefined;
  token2: SwapSelect | undefined;
  setOpenConfirmationalModel: (val: boolean) => void;
  getFee: () => string;
  kind: OrderKind;
  confirmationalSwap: any;
  handleOnClick: ({ token1, token2 }: { token1: SwapSelect; token2: SwapSelect }) => void;
  costOfOneTokenWRTOtherToken: (val?: boolean) => string;
  error: () => string;
}

export const ConfirmationSwap: FC<ConfirmationSwapProps> = ({
  token1,
  token2,
  setOpenConfirmationalModel,
  getFee,
  kind,
  confirmationalSwap,
  handleOnClick,
  costOfOneTokenWRTOtherToken,
  error,
}) => {
  if (!token1 || !token2) return <div />;
  return (
    <SwapContainer>
      <button onClick={() => setOpenConfirmationalModel(false)}>Back</button>
      <div>{error()}</div>
      <div className="my-4">
        <ReadCurrencyInput tokenA={token1} amount={confirmationalSwap.amount1} />
        <div className="py-4" />
        <ReadCurrencyInput tokenA={token2} amount={confirmationalSwap.amount2} />
      </div>
      <SwapInfo
        isEligibleQoute
        costOfOneTokenWRTOtherToken={costOfOneTokenWRTOtherToken}
        qoute={{ data: confirmationalSwap }}
        token1={token1}
        token2={token2}
        getFee={getFee}
        kind={kind}
      />

      <StyledButton
        className="mt-6"
        disabled={!!error}
        onClick={() =>
          handleOnClick({
            token1,
            token2,
          })
        }
        type="button"
      >
        Accept
      </StyledButton>
    </SwapContainer>
  );
};
