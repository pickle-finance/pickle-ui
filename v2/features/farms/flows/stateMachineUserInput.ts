import { createMachine, assign, State } from "xstate";

interface DepositContext {
  txHash: string | undefined;
  amount: number | undefined;
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
  RETRY = "RETRY",
  SUCCESS = "SUCCESS",
}

export const stateMachine = createMachine<DepositContext>({
  id: "deposit",
  initial: States.FORM,
  context: {
    txHash: undefined,
    amount: 0,
  },
  states: {
    [States.FORM]: {
      on: { [Actions.SUBMIT_FORM]: States.AWAITING_CONFIRMATION },
    },
    [States.AWAITING_CONFIRMATION]: {
      entry: assign({
        amount: (_context, event) => event.amount,
      }),
      on: { [Actions.TRANSACTION_SENT]: States.AWAITING_RECEIPT, [Actions.EDIT]: States.FORM },
    },
    [States.AWAITING_RECEIPT]: {
      entry: assign({
        txHash: (_context, event) => event.txHash,
      }),
      on: { [Actions.SUCCESS]: States.SUCCESS, [Actions.FAILURE]: States.FAILURE },
    },
    [States.FAILURE]: {
      on: { [Actions.RETRY]: States.AWAITING_CONFIRMATION },
    },
    [States.SUCCESS]: {
      type: "final",
    },
  },
});
