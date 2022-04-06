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
import { useFarmContract, useTransaction } from "../hooks";
import { TransferEvent } from "containers/Contracts/Jar";
import { UserActions } from "v2/store/user";
import { formatDollars, truncateToMaxDecimals } from "v2/utils";
import { ChainNetwork } from "picklefinance-core";
import { Gauge } from "containers/Contracts/Gauge";
import { Minichef } from "containers/Contracts/Minichef";

interface Props {
  jar: JarWithData;
  balances: UserTokenData | undefined;
}

const StakeFlow: FC<Props> = ({ jar, balances }) => {
  const { t } = useTranslation("common");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const core = useSelector(CoreSelectors.selectCore);
  const [current, send] = useMachine(stateMachine);
  const { account } = useWeb3React<Web3Provider>();
  const dispatch = useAppDispatch();

  const chain = core?.chains.find((chain) => chain.network === jar.chain);
  const FarmContract = useFarmContract(jar.farm?.farmAddress, chain);

  const decimals = jarDecimals(jar);
  const depositTokenBalanceBN = BigNumber.from(balances?.depositTokenBalance || "0");
  const depositTokenBalance = parseFloat(ethers.utils.formatUnits(depositTokenBalanceBN, decimals));
  const pTokenBalanceBN = BigNumber.from(balances?.pAssetBalance || "0");

  const transactionFactory = () => {
    const { chain } = jar;
    const amount = ethers.utils.parseUnits(truncateToMaxDecimals(current.context.amount), decimals);

    if (!FarmContract || !chain || !account) return;

    if (chain === ChainNetwork.Ethereum) {
      return () => (FarmContract as Gauge).deposit(amount);
    }

    const poolId = jar.farm?.details?.poolId;
    if (!poolId) return;

    return () => (FarmContract as Minichef).deposit(poolId, amount, account);
  };

  const callback = (receipt: ethers.ContractReceipt) => {
    if (!account) return;

    /**
     * This will generate two events:
     * 1) Transfer of LP tokens from user's wallet to the jar
     * 2) Mint of pTokens sent to user's wallet
     */
    const events = receipt.events?.filter(({ event }) => event === "Transfer") as TransferEvent[];
    const depositTokenTransferEvent = events.find((event) => event.args.from === account)!;
    const pTokenTransferEvent = events.find((event) => event.args.to === account)!;

    const depositTokenBalance = depositTokenBalanceBN
      .sub(depositTokenTransferEvent.args.value)
      .toString();
    const pAssetBalance = pTokenBalanceBN.add(pTokenTransferEvent.args.value).toString();

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
    true,
  );

  const openModal = () => {
    send(Actions.RESET);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const equivalentValue = () => {
    const depositTokenPrice = jar.depositToken.price;

    if (!depositTokenPrice) return;

    const valueUSD = parseFloat(current.context.amount) * depositTokenPrice;

    return `~ ${formatDollars(valueUSD)}`;
  };

  return (
    <>
      <Button
        type="primary"
        state={depositTokenBalance > 0 ? "enabled" : "disabled"}
        onClick={() => {
          if (depositTokenBalance > 0) openModal();
        }}
        className="w-11"
      >
        +
      </Button>
      <Modal
        isOpen={isModalOpen}
        closeModal={closeModal}
        title={t("v2.farms.depositToken", { token: jar.depositToken.name })}
      >
        {current.matches(States.FORM) && (
          <Form
            balance={depositTokenBalance}
            nextStep={(amount: string) => send(Actions.SUBMIT_FORM, { amount })}
          />
        )}
        {current.matches(States.AWAITING_CONFIRMATION) && (
          <AwaitingConfirmation
            title={t("v2.farms.confirmDeposit")}
            cta={t("v2.actions.deposit")}
            tokenName={jar.depositToken.name}
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

export default StakeFlow;
