import { createMachine, assign } from "xstate";

interface DepositContext {
  txHash: string | undefined;
  amount: string;
  amount1?: string;
  useNative?: boolean;
}

export enum States {
  FORM = "FORM",
  AWAITING_CONFIRMATION = "AWAITING_CONFIRMATION",
  AWAITING_RECEIPT = "AWAITING_RECEIPT",
  FAILURE = "FAILURE",
  SUCCESS = "SUCCESS",
}

export enum Actions {
  SUBMIT_FORM = "SUBMIT_FORM",
  EDIT = "EDIT",
  TRANSACTION_SENT = "TRANSACTION_SENT",
  FAILURE = "FAILURE",
  SUCCESS = "SUCCESS",
  RESET = "RESET",
}

export const stateMachine = createMachine<DepositContext>({
  initial: States.FORM,
  context: {
    txHash: undefined,
    amount: "0",
    amount1: "0",
    useNative: true,
  },
  states: {
    [States.FORM]: {
      on: { [Actions.SUBMIT_FORM]: { target: States.AWAITING_CONFIRMATION } },
    },
    [States.AWAITING_CONFIRMATION]: {
      entry: assign({
        amount: (_context, event) => event.amount,
        amount1: (_context, event) => event.amount1 || undefined,
        useNative: (_context, event) => event.useNative || false,
      }),
      on: {
        [Actions.TRANSACTION_SENT]: { target: States.AWAITING_RECEIPT },
        [Actions.EDIT]: { target: States.FORM },
      },
    },
    [States.AWAITING_RECEIPT]: {
      entry: assign({
        txHash: (_context, event) => event.txHash,
      }),
      on: {
        [Actions.SUCCESS]: { target: States.SUCCESS },
        [Actions.FAILURE]: { target: States.FAILURE },
      },
    },
    [States.FAILURE]: {
      on: { [Actions.RESET]: { target: States.FORM } },
    },
    [States.SUCCESS]: {
      on: { [Actions.RESET]: { target: States.FORM } },
    },
  },
});
