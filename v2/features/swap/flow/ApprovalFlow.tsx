import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import { ethers } from "ethers";
import { useMachine } from "@xstate/react";
import Modal from "v2/components/Modal";
import { stateMachine, Actions, States } from "./stateMachineNoUserInput";
import AwaitingReceipt from "../../farms/flows/AwaitingReceipt";
import Success from "../../farms/flows/Success";
import Failure from "../../farms/flows/Failure";
import { useTokenContract, useTransaction } from "../../farms/flows/hooks";
import AwaitingConfirmationNoUserInput from "v2/features/farms/flows/AwaitingConfirmationNoUserInput";

import { GPv2VaultRelayerAddress } from "../constants";
import { useWeb3React } from "@web3-react/core";
import { SwapButtons } from "../SwapButtons";

const ApprovalFlow: FC<{
  visible: boolean;
  token: string;
  setVisibleApproval: (val: boolean) => void;
}> = ({ visible, token, setVisibleApproval }) => {
  const { t } = useTranslation("common");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [current, send] = useMachine(stateMachine);
  const { chainId } = useWeb3React();
  const TokenContract = useTokenContract(token);

  // const chain = core?.chains.find((chain) => chain.network === jar.chain);
  const amount = ethers.constants.MaxUint256;

  const transactionFactory = () => {
    if (!chainId) return;
    const spenderAddress = GPv2VaultRelayerAddress[chainId].address;

    if (!TokenContract || !spenderAddress) return;

    return () => TokenContract.approve(spenderAddress, amount);
  };

  const callback = (_receipt: ethers.ContractReceipt) => {
    setVisibleApproval(false);
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
      {visible && (
        <SwapButtons type="button" onClick={openModal}>
          {t("v2.actions.approve")}
        </SwapButtons>
      )}
      <Modal
        isOpen={isModalOpen}
        closeModal={closeModal}
        title={t("v2.farms.approveToken", { token: token })}
      >
        {current.matches(States.AWAITING_CONFIRMATION) && (
          <AwaitingConfirmationNoUserInput
            title={t("v2.farms.givePermission", { token })}
            error={error}
            sendTransaction={sendTransaction}
            isWaiting={isWaiting}
            cta={t("v2.actions.approve")}
          />
        )}
        {current.matches(States.AWAITING_RECEIPT) && (
          <AwaitingReceipt chainExplorer={""} txHash={current.context.txHash} />
        )}
        {current.matches(States.SUCCESS) && (
          <Success chainExplorer={""} txHash={current.context.txHash} closeModal={closeModal} />
        )}
        {current.matches(States.FAILURE) && (
          <Failure
            chainExplorer={""}
            txHash={current.context.txHash}
            retry={() => send(Actions.RESET)}
          />
        )}
      </Modal>
    </>
  );
};

export default ApprovalFlow;
