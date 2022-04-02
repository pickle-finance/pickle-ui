import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { BigNumber, ethers } from "ethers";
import { useMachine } from "@xstate/react";
import { useSelector } from "react-redux";

import { useAppDispatch } from "v2/store";
import Button from "v2/components/Button";
import Modal from "v2/components/Modal";
import { CoreSelectors, JarWithData } from "v2/store/core";
import { UserActions } from "v2/store/user";
import { sleep } from "v2/utils";
import { stateMachine, Actions, States } from "../stateMachineNoUserInput";
import AwaitingConfirmation from "./AwaitingConfirmation";
import AwaitingReceipt from "../AwaitingReceipt";
import Success from "../Success";
import Failure from "../Failure";
import { useTokenContract } from "../hooks";

interface Props {
  jar: JarWithData;
  visible: boolean;
}

const ApprovalFlow: FC<Props> = ({ jar, visible }) => {
  const { t } = useTranslation("common");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>();
  const [progressStatus, setProgressStatus] = useState<string>(t("v2.farms.transactionPending"));
  const core = useSelector(CoreSelectors.selectCore);
  const [current, send] = useMachine(stateMachine);
  const dispatch = useAppDispatch();
  const { account } = useWeb3React<Web3Provider>();
  const TokenContract = useTokenContract(jar.depositToken.addr);

  const chain = core?.chains.find((chain) => chain.network === jar.chain);
  const { contract } = jar;

  if (!TokenContract || !account) return null;

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const sendTransaction = async () => {
    setError(undefined);
    setIsWaiting(true);

    try {
      const amount = ethers.constants.MaxUint256;
      const transaction = await TokenContract.approve(contract, amount);

      send(Actions.TRANSACTION_SENT, { txHash: transaction.hash });

      transaction
        .wait()
        .then(
          async () => {
            setProgressStatus(t("v2.farms.waitingForBlockConfirmation"));

            let allowance: BigNumber;

            while (true) {
              allowance = await TokenContract.allowance(account, contract);
              const success = allowance.gt(ethers.constants.Zero);

              if (success) break;

              await sleep(1000);
            }

            dispatch(UserActions.refresh());
            send(Actions.SUCCESS);
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

  return (
    <>
      {visible && <Button onClick={openModal}>{t("v2.actions.approve")}</Button>}
      <Modal
        isOpen={isModalOpen}
        closeModal={closeModal}
        title={t("v2.farms.approveToken", { token: jar.depositToken.name })}
      >
        {current.matches(States.AWAITING_CONFIRMATION) && (
          <AwaitingConfirmation
            tokenName={jar.depositToken.name}
            error={error}
            sendTransaction={sendTransaction}
            isWaiting={isWaiting}
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

export default ApprovalFlow;
