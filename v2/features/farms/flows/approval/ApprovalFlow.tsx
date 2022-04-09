import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import { ethers } from "ethers";
import { useMachine } from "@xstate/react";
import { UserTokenData } from "picklefinance-core/lib/client/UserModel";

import Button from "v2/components/Button";
import Modal from "v2/components/Modal";
import { CoreSelectors, JarWithData } from "v2/store/core";
import { stateMachine, Actions, States } from "../stateMachineNoUserInput";
import AwaitingConfirmation from "./AwaitingConfirmation";
import AwaitingReceipt from "../AwaitingReceipt";
import Success from "../Success";
import Failure from "../Failure";
import { useTokenContract, useTransaction } from "../hooks";
import { AppDispatch, useAppSelector } from "v2/store";
import { UserActions } from "v2/store/user";
import { ApprovalEvent } from "containers/Contracts/Erc20";
import { eventsByName } from "../utils";

type ApprovalType = "jar" | "farm";

interface ApprovalData {
  tokenAddress: string;
  tokenName: string | undefined;
  spenderAddress: string | undefined;
  storeAttribute: keyof UserTokenData;
}

const approvalData = (jar: JarWithData, type: ApprovalType): ApprovalData => {
  if (type === "jar") {
    return {
      tokenAddress: jar.depositToken.addr,
      tokenName: jar.depositToken.name,
      spenderAddress: jar.contract,
      storeAttribute: "jarAllowance",
    };
  }

  return {
    tokenAddress: jar.contract,
    tokenName: jar.farm?.farmDepositTokenName,
    spenderAddress: jar.farm?.farmAddress,
    storeAttribute: "farmAllowance",
  };
};

interface Props {
  jar: JarWithData;
  type: ApprovalType;
  visible: boolean;
}

const ApprovalFlow: FC<Props> = ({ jar, visible, type }) => {
  const { t } = useTranslation("common");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const core = useAppSelector(CoreSelectors.selectCore);
  const [current, send] = useMachine(stateMachine);
  const approvalConfig = approvalData(jar, type);
  const TokenContract = useTokenContract(approvalConfig.tokenAddress);

  const chain = core?.chains.find((chain) => chain.network === jar.chain);
  const amount = ethers.constants.MaxUint256;

  const transactionFactory = () => {
    const { spenderAddress } = approvalConfig;

    if (!TokenContract || !spenderAddress) return;

    return () => TokenContract.approve(spenderAddress, amount);
  };

  const callback = (receipt: ethers.ContractReceipt, dispatch: AppDispatch) => {
    const approvalEvents = eventsByName<ApprovalEvent>(receipt, "Approval");
    const approvedAmount = approvalEvents[0].args[2];

    dispatch(
      UserActions.setTokenData({
        apiKey: jar.details.apiKey,
        data: { [approvalConfig.storeAttribute]: approvedAmount.toString() },
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
        title={t("v2.farms.approveToken", { token: approvalConfig.tokenName })}
      >
        {current.matches(States.AWAITING_CONFIRMATION) && (
          <AwaitingConfirmation
            tokenName={approvalConfig.tokenName}
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
