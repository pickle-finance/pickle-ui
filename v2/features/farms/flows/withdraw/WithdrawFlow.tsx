import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { BigNumber, ethers } from "ethers";
import { useMachine } from "@xstate/react";
import { useSelector } from "react-redux";
import { UserTokenData } from "picklefinance-core/lib/client/UserModel";

import { useAppDispatch } from "v2/store";
import Button from "v2/components/Button";
import Modal from "v2/components/Modal";
import { CoreSelectors, JarWithData } from "v2/store/core";
import { stateMachine, Actions, States } from "../stateMachineUserInput";
import Form from "../deposit/Form";
import { jarDecimals } from "v2/utils/user";
import AwaitingConfirmation from "../deposit/AwaitingConfirmation";
import AwaitingReceipt from "../AwaitingReceipt";
import Success from "../Success";
import Failure from "../Failure";
import { useJarContract, useTransaction } from "../hooks";
import { TransferEvent } from "containers/Contracts/Jar";
import { UserActions } from "v2/store/user";
import { truncateToMaxDecimals } from "v2/utils";

interface Props {
  jar: JarWithData;
  visible: boolean;
  balances: UserTokenData | undefined;
}

const WithdrawFlow: FC<Props> = ({ jar, visible, balances }) => {
  const { t } = useTranslation("common");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const core = useSelector(CoreSelectors.selectCore);
  const [current, send] = useMachine(stateMachine);
  const { account } = useWeb3React<Web3Provider>();
  const dispatch = useAppDispatch();

  const { contract } = jar;
  const JarContract = useJarContract(contract);

  const chain = core?.chains.find((chain) => chain.network === jar.chain);

  const decimals = jarDecimals(jar);
  const depositTokenBalanceBN = BigNumber.from(balances?.depositTokenBalance || "0");
  const pTokenBalanceBN = BigNumber.from(balances?.pAssetBalance || "0");
  const pTokenBalance = parseFloat(ethers.utils.formatUnits(pTokenBalanceBN, 18));

  const transactionFactory = () => {
    if (!JarContract) return;

    const amount = ethers.utils.parseUnits(truncateToMaxDecimals(current.context.amount), decimals);

    return () => JarContract.withdraw(amount);
  };

  const callback = (receipt: ethers.ContractReceipt) => {
    if (!account) return;

    /**
     * This will generate a larger number of transfer events but the two we care about are:
     * 1) Burn of pTokens taken out of user's wallet
     * 2) Transfer of LP tokens back to user's wallet
     */
    const events = receipt.events?.filter(({ event }) => event === "Transfer") as TransferEvent[];

    const pTokenTransferEvent = events.find((event) => event.args.from === account)!;
    const depositTokenTransferEvent = events.find((event) => event.args.to === account)!;

    const depositTokenBalance = depositTokenBalanceBN
      .add(depositTokenTransferEvent.args.value)
      .toString();
    const pAssetBalance = pTokenBalanceBN.sub(pTokenTransferEvent.args.value).toString();

    dispatch(
      UserActions.setTokenData({
        apiKey: jar.details.apiKey,
        data: {
          depositTokenBalance,
          pAssetBalance,
        },
      }),
    );
  };

  const { sendTransaction, error, setError, isWaiting } = useTransaction(
    transactionFactory(),
    callback,
    send,
  );

  if (!visible) return null;

  const openModal = () => {
    send(Actions.RESET);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const equivalentValue = () => {
    const jarDepositTokenName = jar.depositToken.name;
    const ratio = jar.details.ratio;

    if (!ratio) return;

    return `~ ${parseFloat(current.context.amount) * ratio} ${jarDepositTokenName}`;
  };

  return (
    <>
      <Button
        type="secondary"
        state={pTokenBalance > 0 ? "enabled" : "disabled"}
        onClick={() => {
          if (pTokenBalance > 0) openModal();
        }}
        className="w-11"
      >
        -
      </Button>
      <Modal
        isOpen={isModalOpen}
        closeModal={closeModal}
        title={t("v2.farms.withdrawToken", { token: jar.farm?.farmDepositTokenName })}
      >
        {current.matches(States.FORM) && (
          <Form
            balance={pTokenBalance}
            nextStep={(amount: string) => send(Actions.SUBMIT_FORM, { amount })}
          />
        )}
        {current.matches(States.AWAITING_CONFIRMATION) && (
          <AwaitingConfirmation
            title={t("v2.farms.confirmWithdrawal")}
            cta={t("v2.actions.withdraw")}
            tokenName={jar.farm?.farmDepositTokenName}
            amount={current.context.amount}
            equivalentValue={equivalentValue()}
            error={error}
            sendTransaction={sendTransaction}
            isWaiting={isWaiting}
            previousStep={() => {
              setError(undefined);
              send(Actions.EDIT);
            }}
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

export default WithdrawFlow;
