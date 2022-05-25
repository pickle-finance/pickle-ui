import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { BigNumber, ethers } from "ethers";
import { useMachine } from "@xstate/react";
import { UserTokenData } from "picklefinance-core/lib/client/UserModel";
import { Chains } from "picklefinance-core";

import { AppDispatch } from "v2/store";
import Button from "v2/components/Button";
import Modal from "v2/components/Modal";
import { AssetWithData } from "v2/store/core";
import { stateMachine, Actions, States } from "../stateMachineUserInput";
import Form from "../deposit/Form";
import { jarDecimals } from "v2/utils/user";
import AwaitingConfirmation from "../deposit/AwaitingConfirmation";
import AwaitingReceipt from "../AwaitingReceipt";
import Success from "../Success";
import Failure from "../Failure";
import { useJarContract, useTransaction } from "../hooks";
import { TransferEvent } from "v1/containers/Contracts/Jar";
import { UserActions } from "v2/store/user";
import { truncateToMaxDecimals } from "v2/utils";
import { eventsByName } from "../utils";
import { isJar } from "v2/store/core.helpers";

interface Props {
  asset: AssetWithData;
  balances: UserTokenData | undefined;
  isUniV3?: boolean | undefined;
}

const WithdrawFlow: FC<Props> = ({ asset, balances, isUniV3 = false }) => {
  const { t } = useTranslation("common");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [current, send] = useMachine(stateMachine);
  const { account } = useWeb3React<Web3Provider>();

  const { contract } = asset;
  const JarContract = useJarContract(contract);

  const chain = Chains.get(asset.chain);
  const decimals = jarDecimals(asset);
  const depositTokenBalanceBN = BigNumber.from(balances?.depositTokenBalance || "0");
  const pTokenBalanceBN = BigNumber.from(balances?.pAssetBalance || "0");

  const transactionFactory = () => {
    if (!JarContract) return;

    const amount = ethers.utils.parseUnits(truncateToMaxDecimals(current.context.amount), decimals);

    return () => JarContract.withdraw(amount);
  };

  const callback = (receipt: ethers.ContractReceipt, dispatch: AppDispatch) => {
    if (!account) return;

    /**
     * This will generate a larger number of transfer events but the two we care about are:
     * 1) Burn of pTokens taken out of user's wallet
     * 2) Transfer of LP tokens back to user's wallet
     */
    const transferEvents = eventsByName<TransferEvent>(receipt, "Transfer");
    const pTokenTransferEvent = transferEvents.find((event) => event.args.from === account)!;
    const pAssetBalance = pTokenBalanceBN.sub(pTokenTransferEvent.args.value).toString();

    if (isUniV3 && isJar(asset)) {
      const token0Name = asset.token0!.name;
      const token1Name = asset.token1!.name;
      const token0Data = balances?.componentTokenBalances[token0Name];
      const token1Data = balances?.componentTokenBalances[token1Name];

      const depositToken0BalanceBN = BigNumber.from(token0Data?.balance || "0");
      const depositToken1BalanceBN = BigNumber.from(token1Data?.balance || "0");

      const token0TransferEvent = transferEvents.find(
        (event) =>
          event.args.to === account &&
          event.address.toLowerCase() === asset.token0!.address.toLowerCase(),
      )!;
      const token1TransferEvent = transferEvents.find(
        (event) =>
          event.args.to === account &&
          event.address.toLowerCase() === asset.token1!.address.toLowerCase(),
      )!;

      const newToken0Balance = depositToken0BalanceBN
        .sub(token0TransferEvent.args.value)
        .toString();

      const newToken1Balance = depositToken1BalanceBN
        .sub(token1TransferEvent.args.value)
        .toString();
      dispatch(
        UserActions.setTokenData({
          account,
          apiKey: asset.details.apiKey,
          data: {
            componentTokenBalances: {
              [token0Name]: {
                ...balances!.componentTokenBalances[token0Name],
                balance: newToken0Balance,
              },
              [token1Name]: {
                ...balances!.componentTokenBalances[token1Name],
                balance: newToken1Balance,
              },
            },
            pAssetBalance,
          },
        }),
      );
    } else {
      const depositTokenTransferEvent = transferEvents.find((event) => event.args.to === account)!;

      const depositTokenBalance = depositTokenBalanceBN
        .add(depositTokenTransferEvent.args.value)
        .toString();

      dispatch(
        UserActions.setTokenData({
          account,
          apiKey: asset.details.apiKey,
          data: {
            depositTokenBalance,
            pAssetBalance,
          },
        }),
      );
    }
  };

  const { sendTransaction, error, setError, isWaiting } = useTransaction(
    transactionFactory(),
    callback,
    send,
  );

  const openModal = () => {
    send(Actions.RESET);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const equivalentValue = () => {
    if (!isJar(asset)) return;

    const jarDepositTokenName = asset.depositToken.name;
    const ratio = asset.details.ratio;

    if (!ratio) return;

    return `~ ${parseFloat(current.context.amount) * ratio} ${jarDepositTokenName}`;
  };

  return (
    <>
      <Button
        type="secondary"
        state={pTokenBalanceBN.gt(0) ? "enabled" : "disabled"}
        onClick={openModal}
        className="w-11"
      >
        -
      </Button>
      <Modal
        isOpen={isModalOpen}
        closeModal={closeModal}
        title={t("v2.farms.withdrawToken", {
          token: isJar(asset) ? asset.farm?.farmDepositTokenName : asset.depositToken.name,
        })}
      >
        {current.matches(States.FORM) && (
          <Form
            balance={balances?.pAssetBalance || "0"}
            decimals={decimals}
            nextStep={(amount: string) => send(Actions.SUBMIT_FORM, { amount })}
          />
        )}
        {current.matches(States.AWAITING_CONFIRMATION) && (
          <AwaitingConfirmation
            title={t("v2.farms.confirmWithdrawal")}
            cta={t("v2.actions.withdraw")}
            tokenName={isJar(asset) ? asset.farm?.farmDepositTokenName : asset.depositToken.name}
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
