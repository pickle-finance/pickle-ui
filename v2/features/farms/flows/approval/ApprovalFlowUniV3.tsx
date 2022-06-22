import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import { ethers } from "ethers";
import { useMachine } from "@xstate/react";
import { UserTokenData } from "picklefinance-core/lib/client/UserModel";
import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";

import Button, { ButtonState } from "v2/components/Button";
import Modal from "v2/components/Modal";
import { JarWithData } from "v2/store/core";
import { stateMachine, Actions } from "../stateMachineNoUserInput";
import { useTokenContract, useTransaction } from "../hooks";
import { useAppDispatch } from "v2/store";
import { UserActions } from "v2/store/user";
import { ApprovalEvent, Erc20 } from "v1/containers/Contracts/Erc20";
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
  state: ButtonState;
  visible: boolean;
}

const ApprovalFlowUniV3: FC<Props> = ({ jar, visible, type, state, balances }) => {
  const { t } = useTranslation("common");
  const { account } = useWeb3React<Web3Provider>();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [, send] = useMachine(stateMachine);
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
    if (!account) return;

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
          account,
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
      {visible && (
        <Button onClick={openModal} state={state}>
          {t("v2.actions.approve")}
        </Button>
      )}
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
