import { FC, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { useMachine } from "@xstate/react";
import { ethers } from "ethers";
import { useSelector } from "react-redux";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

import Button from "v2/components/Button";
import Modal from "v2/components/Modal";
import { CoreSelectors, JarWithData } from "v2/store/core";
import { stateMachine, Actions, States } from "../../../farms/flows/stateMachineUserInput";
import AwaitingConfirmation from "../../../farms/flows/deposit/AwaitingConfirmation";
import { useAppDispatch } from "v2/store";
import AwaitingReceipt from "../../../farms/flows/AwaitingReceipt";
import Success from "../../../farms/flows/Success";
import Failure from "../../../farms/flows/Failure";
import { DILL_ADDRESS, sleep } from "v2/utils";
import { UserActions } from "v2/store/user";
import { ThemeActions } from "v2/store/theme";
import { ChainNetwork } from "picklefinance-core";
import { useDillContract } from "../hooks";
import ErrorMessage from "../../../farms/flows/Error";
import { getEpochSecondForDay } from "../utils";

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
  const [error, setError] = useState<Error | undefined>();
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>(t("v2.farms.transactionPending"));
  const [current, send] = useMachine(stateMachine);
  const core = useSelector(CoreSelectors.selectCore);
  const dispatch = useAppDispatch();
  const chain = core?.chains.find((chain) => chain.network === ChainNetwork.Ethereum);

  const { account } = useWeb3React<Web3Provider>();
  const DillContract = useDillContract(DILL_ADDRESS);

  if (!DillContract || !account) return null;

  const sendTransaction = async () => {
    setError(undefined);
    setIsWaiting(true);

    try {
      const amountBN = ethers.utils.parseEther(userInput);

      const transaction = dillBalance
        ? await DillContract.increase_amount(amountBN, {
            gasLimit: 350000,
          })
        : await DillContract.create_lock(amountBN, getEpochSecondForDay(lockTime), {
            gasLimit: 600000,
          });

      send(Actions.TRANSACTION_SENT, { txHash: transaction.hash });

      transaction
        .wait()
        .then(
          async () => {
            setProgressStatus(t("v2.farms.waitingForBlockConfirmation"));

            while (true) {
              const balance = await DillContract["balanceOf(address)"](account);

              const success = balance.gt(ethers.utils.parseEther(dillBalance.toString()));

              if (success) break;

              await sleep(1000);
            }

            dispatch(UserActions.refresh());

            send(Actions.SUCCESS);
            dispatch(ThemeActions.setIsConfettiOn(true));
          },
          () => {
            send(Actions.FAILURE);
          },
        )
        .finally(() => setIsWaiting(false));
    } catch (error) {
      setError(error as Error);
      setIsWaiting(false);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    closeParentModal();
  };

  // Hack to skip straight to AWAITING_CONFIRMATION
  useEffect(() => {
    send(Actions.SUBMIT_FORM, { amount: userInput });
  }, []);

  if (!visible) return null;

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
          <AwaitingReceipt
            chainExplorer={chain?.explorer}
            txHash={current.context.txHash}
            progressStatus={progressStatus}
          />
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
            retry={() => send(Actions.RETRY)}
          />
        )}
      </Modal>
    </>
  );
};

export default DepositFlow;
