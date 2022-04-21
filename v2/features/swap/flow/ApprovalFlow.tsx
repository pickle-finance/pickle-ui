import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import { ethers } from "ethers";
import { useMachine } from "@xstate/react";
import Button from "v2/components/Button";
import Modal from "v2/components/Modal";
import { CoreSelectors, JarWithData } from "v2/store/core";
import { stateMachine, Actions, States } from "./stateMachineNoUserInput";
import AwaitingConfirmation from "../../farms/flows/approval/AwaitingConfirmation";
import AwaitingReceipt from "../../farms/flows/AwaitingReceipt";
import Success from "../../farms/flows/Success";
import Failure from "../../farms/flows/Failure";
import { useTokenContract, useTransaction } from "../../farms/flows/hooks";
import { ApprovalEvent } from "containers/Contracts/Erc20";

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

  const callback = (receipt: ethers.ContractReceipt) => {
    const approvalEvent = receipt.events?.find(
      ({ event }) => event === "Approval",
    ) as ApprovalEvent;
    const approvedAmount = approvalEvent.args[2];
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
          <AwaitingConfirmation
            tokenName={token}
            error={error}
            sendTransaction={sendTransaction}
            isWaiting={isWaiting}
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
