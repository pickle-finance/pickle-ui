import { FC, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { useMachine } from "@xstate/react";
import { BigNumber, ethers } from "ethers";
import { useSelector } from "react-redux";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { ChainNetwork, Chains } from "picklefinance-core";

import Button from "v2/components/Button";
import Modal from "v2/components/Modal";
import { CoreSelectors } from "v2/store/core";
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
import { getEpochSecondForDay } from "../utils";
import { useTransaction } from "v2/features/farms/flows/hooks";

interface Props {
  visible: boolean;
  userInput: string;
  error: Error | undefined;
  lockTime: Date;
  dillBalance: number;
  closeParentModal: () => void;
}

const DepositFlow: FC<Props> = ({
  visible,
  userInput,
  error: balanceError,
  lockTime,
  dillBalance,
  closeParentModal,
}) => {
  const { t } = useTranslation("common");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [current, send] = useMachine(stateMachine);
  const core = useSelector(CoreSelectors.selectCore);
  const chain = Chains.get(ChainNetwork.Ethereum);

  const { account } = useWeb3React<Web3Provider>();
  const DillContract = useDillContract(DILL_ADDRESS);

  const transactionFactory = () => {
    if (!DillContract) return;

    const amountBN = userInput ? ethers.utils.parseEther(userInput) : BigNumber.from(0);

    return () =>
      dillBalance
        ? DillContract.increase_amount(amountBN, {
            gasLimit: 350000,
          })
        : DillContract.create_lock(amountBN, getEpochSecondForDay(lockTime), {
            gasLimit: 600000,
          });
  };

  const callback = async (_receipt: ethers.ContractReceipt, dispatch: AppDispatch) => {
    if (!DillContract || !account) return;

    while (true) {
      const balance = await DillContract["balanceOf(address)"](account);

      const success = balance.gt(ethers.utils.parseEther(dillBalance.toString()));

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
    send(Actions.SUBMIT_FORM, { amount: userInput });
  }, []);

  return (
    <>
      {visible && (
        <>
          <ErrorMessage error={balanceError} />
          <Button
            type="primary"
            state={parseFloat(userInput) > 0 && !balanceError ? "enabled" : "disabled"}
            onClick={() => {
              if (parseFloat(userInput) > 0) {
                openModal();
                send(Actions.SUBMIT_FORM, { userInput });
              }
            }}
          >
            {dillBalance ? t("v2.dill.addPickle") : t("v2.dill.createLock")}
          </Button>
        </>
      )}
      <Modal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        title={dillBalance ? t("v2.dill.addDill") : t("v2.dill.depositPickle")}
      >
        {current.matches(States.AWAITING_CONFIRMATION) && (
          <AwaitingConfirmation
            tokenName={t("v2.dill.pickle")}
            amount={userInput}
            depositTokenPrice={core?.prices?.pickle}
            error={error}
            sendTransaction={sendTransaction}
            isWaiting={isWaiting}
            previousStep={() => setIsModalOpen(false)}
            lockEnd={dillBalance ? undefined : lockTime}
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

export default DepositFlow;
