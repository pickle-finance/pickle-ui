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
import { useAppDispatch, useAppSelector } from "v2/store";
import { UserActions } from "v2/store/user";
import { ApprovalEvent, Erc20 } from "containers/Contracts/Erc20";
import UniV3AwaitingConfirmation from "./AwaitingConfirmationUniV3";

type ApprovalType = "jar" | "farm";

interface UniV3ApprovalData {
  spenderAddress: string | undefined;
  tokens: {
    [key: string]: {
      tokenAddress: string;
      tokenName: string | undefined;
    };
  };
}

const approvalData = (jar: JarWithData, type: ApprovalType): UniV3ApprovalData => {
  if (type === "jar" && jar.depositToken.components && jar.token0 && jar.token1) {
    return {
      spenderAddress: jar.contract,
      tokens: {
        [jar.depositToken.components[0]]: {
          tokenAddress: jar.token0.address,
          tokenName: jar.token0!.name.toUpperCase(),
        },
        [jar.depositToken.components[1]]: {
          tokenAddress: jar.token1.address,
          tokenName: jar.token1!.name.toUpperCase(),
        },
      },
    };
  }

  return { spenderAddress: jar.contract, tokens: {} };
};

interface Props {
  jar: JarWithData;
  type: ApprovalType;
  balances: UserTokenData | undefined;
  visible: boolean;
}

const ApprovalFlowUniV3: FC<Props> = ({ jar, visible, type, balances }) => {
  const { t } = useTranslation("common");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [current, send] = useMachine(stateMachine);
  const dispatch = useAppDispatch();
  const approvalConfig = approvalData(jar, type);

  const token0Data = approvalConfig.tokens[jar.token0!.name];
  const token1Data = approvalConfig.tokens[jar.token1!.name];

  const TokenContract0 = useTokenContract(token0Data.tokenAddress);
  const TokenContract1 = useTokenContract(token1Data.tokenAddress);

  const amount = ethers.constants.MaxUint256;

  const transactionFactory = (tokenContract: Erc20 | undefined) => {
    const { spenderAddress } = approvalConfig;

    if (!tokenContract || !spenderAddress) return;

    return () => tokenContract.approve(spenderAddress, amount);
  };

  const callback = (receipt: ethers.ContractReceipt) => {
    const approvalEvent = receipt.events?.find(
      ({ event }) => event === "Approval",
    ) as ApprovalEvent;
    const approvedAmount = approvalEvent.args[2];

    const tokenAddress = approvalEvent.address;
    const tokenKey = Object.keys(approvalConfig.tokens).find(
      (token) =>
        approvalConfig.tokens[token].tokenAddress.toLowerCase() === tokenAddress.toLowerCase(),
    );

    if (tokenKey != undefined)
      dispatch(
        UserActions.setTokenData({
          apiKey: jar.details.apiKey,
          data: {
            componentTokenBalances: {
              ...balances!.componentTokenBalances,
              [tokenKey]: {
                ...balances!.componentTokenBalances[tokenKey],
                allowance: approvedAmount.toString(),
              },
            },
          },
        }),
      );
  };

  const { sendTransaction: transaction0, error: error0, isWaiting: isWaiting0 } = useTransaction(
    transactionFactory(TokenContract0),
    callback,
    send,
  );

  const { sendTransaction: transaction1, error: error1, isWaiting: isWaiting1 } = useTransaction(
    transactionFactory(TokenContract1),
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
      <Modal isOpen={isModalOpen} closeModal={closeModal} title={t("v2.farms.approveTokens")}>
        <UniV3AwaitingConfirmation
          error={error0 || error1}
          sendTransaction0={transaction0}
          sendTransaction1={transaction1}
          isWaiting0={isWaiting0}
          isWaiting1={isWaiting1}
          balances={balances}
          closeModal={closeModal}
        />
      </Modal>
    </>
  );
};

export default ApprovalFlowUniV3;
