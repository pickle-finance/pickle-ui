import { createMachine, assign } from "xstate";

interface ApprovalContext {
  txHash: string | undefined;
}

export enum States {
  AWAITING_CONFIRMATION = "AWAITING_CONFIRMATION",
  AWAITING_RECEIPT = "AWAITING_RECEIPT",
  FAILURE = "FAILURE",
  SUCCESS = "SUCCESS",
}

export enum Actions {
  TRANSACTION_SENT = "TRANSACTION_SENT",
  FAILURE = "FAILURE",
  RETRY = "RETRY",
  SUCCESS = "SUCCESS",
}

export const stateMachine = createMachine<ApprovalContext>({
  id: "approval",
  initial: States.AWAITING_CONFIRMATION,
  context: {
    txHash: undefined,
  },
  states: {
    [States.AWAITING_CONFIRMATION]: {
      entry: assign({ txHash: undefined }),
      on: { [Actions.TRANSACTION_SENT]: States.AWAITING_RECEIPT },
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
