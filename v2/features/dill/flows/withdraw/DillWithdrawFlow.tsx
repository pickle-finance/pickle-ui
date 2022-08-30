import { FC, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { useMachine } from "@xstate/react";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { ChainNetwork, Chains } from "picklefinance-core";

import Button from "v2/components/Button";
import Modal from "v2/components/Modal";
import { stateMachine, Actions, States } from "../../../farms/flows/stateMachineUserInput";
import AwaitingConfirmation from "./AwaitingConfirmation";
import { AppDispatch } from "v2/store";
import AwaitingReceipt from "../../../farms/flows/AwaitingReceipt";
import Success from "../../../farms/flows/Success";
import Failure from "../../../farms/flows/Failure";
import { DILL_ADDRESS, sleep } from "v2/utils";
import { UserActions } from "v2/store/user";
import { useDillContract } from "../hooks";
import ErrorMessage from "../../../farms/flows/Error";
import { useTransaction } from "v2/features/farms/flows/hooks";
import { formatEther } from "ethers/lib/utils";
import { IUserDillStats } from "picklefinance-core/lib/client/UserModel";

const WithdrawFlow: FC<Props> = ({ visible, dill, error: balanceError, closeParentModal }) => {
  const { t } = useTranslation("common");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [current, send] = useMachine(stateMachine);
  const chain = Chains.get(ChainNetwork.Ethereum);

  const { account } = useWeb3React<Web3Provider>();
  const DillContract = useDillContract(DILL_ADDRESS);

  const transactionFactory = () => {
    if (!DillContract) return;

    return () =>
      DillContract.withdraw({
        gasLimit: 410000,
      });
  };

  const callback = async (_receipt: ethers.ContractReceipt, dispatch: AppDispatch) => {
    if (!DillContract || !account) return;

    while (true) {
      const balance = await DillContract.locked(account, {
        gasLimit: 410000,
      });

      const success = balance.amount.isZero();

      if (success) break;

      await sleep(1000);
    }

    dispatch(UserActions.refresh());
  };

  const { sendTransaction, error, isWaiting } = useTransaction(
    transactionFactory(),
    callback,
    send,
    true,
  );

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    closeParentModal();
  };

  // Hack to skip straight to AWAITING_CONFIRMATION
  useEffect(() => {
    send(Actions.SUBMIT_FORM);
  }, []);

  return (
    <>
      {visible && (
        <>
          <ErrorMessage error={balanceError} />
          <Button
            type="primary"
            state={!balanceError ? "enabled" : "disabled"}
            onClick={() => {
              openModal();
              send(Actions.SUBMIT_FORM);
            }}
          >
            {`${t("v2.dill.withdraw", {
              nPickles: parseFloat(formatEther(dill.pickleLocked)).toFixed(2),
            })}`}
          </Button>
        </>
      )}
      <Modal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        title={`${t("v2.actions.withdraw")} PICKLE`}
      >
        {current.matches(States.AWAITING_CONFIRMATION) && (
          <AwaitingConfirmation
            error={error}
            sendTransaction={sendTransaction}
            isWaiting={isWaiting}
            previousStep={() => setIsModalOpen(false)}
          />
        )}
        {current.matches(States.AWAITING_RECEIPT) && (
          <AwaitingReceipt chainExplorer={chain?.explorer} txHash={current.context.txHash} />
        )}
        {current.matches(States.SUCCESS) && (
          <Success
            chainExplorer={chain?.explorer}
            txHash={current.context.txHash}
            closeModal={closeModal}
          />
        )}
        {current.matches(States.FAILURE) && (
          <Failure
            chainExplorer={chain?.explorer}
            txHash={current.context.txHash}
            retry={() => send(Actions.RESET)}
          />
        )}
      </Modal>
    </>
  );
};

interface Props {
  visible: boolean;
  dill: IUserDillStats;
  error: Error | undefined;
  closeParentModal: () => void;
}

export default WithdrawFlow;
