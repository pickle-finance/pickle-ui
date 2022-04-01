import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import { ethers } from "ethers";
import { useMachine } from "@xstate/react";

import Button from "v2/components/Button";
import Modal from "v2/components/Modal";
import { CoreSelectors, JarWithData } from "v2/store/core";
import { stateMachine, Actions, States } from "../stateMachineNoUserInput";
import AwaitingConfirmation from "./AwaitingConfirmation";
import AwaitingReceipt from "../AwaitingReceipt";
import Success from "../Success";
import Failure from "../Failure";
import { useTokenContract, useTransaction } from "../hooks";
import { useAppDispatch, useAppSelector } from "v2/store";
import { UserActions } from "v2/store/user";
import { ApprovalEvent } from "containers/Contracts/Erc20";

interface Props {
  jar: JarWithData;
  visible: boolean;
}

const ApprovalFlow: FC<Props> = ({ jar, visible }) => {
  const { t } = useTranslation("common");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const core = useAppSelector(CoreSelectors.selectCore);
  const [current, send] = useMachine(stateMachine);
  const dispatch = useAppDispatch();
  const TokenContract = useTokenContract(jar.depositToken.addr);

  const { contract } = jar;
  const chain = core?.chains.find((chain) => chain.network === jar.chain);
  const amount = ethers.constants.MaxUint256;

  const transactionFactory = () => {
    if (!TokenContract) return;

    return () => TokenContract.approve(contract, amount);
  };

  const callback = (receipt: ethers.ContractReceipt) => {
    const approvalEvent = receipt.events?.find(
      ({ event }) => event === "Approval",
    ) as ApprovalEvent;
    const approvedAmount = approvalEvent.args[2];

    dispatch(
      UserActions.setTokenData({
        apiKey: jar.details.apiKey,
        data: { jarAllowance: approvedAmount.toString() },
      }),
    );
  };

  const { sendTransaction, error, isWaiting } = useTransaction(
    transactionFactory(),
    callback,
    send,
  );

  const openModal = () => {
    send(Actions.RESET);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

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

export default ApprovalFlow;
