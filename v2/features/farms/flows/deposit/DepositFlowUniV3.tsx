import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { BigNumber, ethers } from "ethers";
import { useMachine } from "@xstate/react";
import { useSelector } from "react-redux";
import { UserTokenData } from "picklefinance-core/lib/client/UserModel";

import { AppDispatch } from "v2/store";
import Button from "v2/components/Button";
import Modal from "v2/components/Modal";
import { CoreSelectors, JarWithData } from "v2/store/core";
import { stateMachine, Actions, States } from "../stateMachineUserInput";
import AwaitingReceipt from "../AwaitingReceipt";
import Success from "../Success";
import Failure from "../Failure";
import { useTransaction, useUniV3JarContract } from "../hooks";
import { TransferEvent } from "containers/Contracts/Jar";
import { UserActions } from "v2/store/user";
import { formatDollars, truncateToMaxDecimals } from "v2/utils";
import AwaitingConfirmationUniV3 from "./AwaitingConfirmationUniV3";
import FormUniV3 from "./FormUniV3";
import { isAcceptingDeposits } from "v2/store/core.helpers";

interface Props {
  jar: JarWithData;
  balances: UserTokenData | undefined;
}

const DepositFlowUniV3: FC<Props> = ({ jar, balances }) => {
  const { t } = useTranslation("common");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const core = useSelector(CoreSelectors.selectCore);
  const [current, send] = useMachine(stateMachine);
  const { account } = useWeb3React<Web3Provider>();

  const { contract } = jar;
  const JarContract = useUniV3JarContract(contract);

  const chain = core?.chains.find((chain) => chain.network === jar.chain);

  const token0Name = jar.token0!.name;
  const token1Name = jar.token1!.name;

  const token0Decimals =
    core?.tokens.find((x) => x.chain === jar.chain && x.id === token0Name)?.decimals || 18;

  const token1Decimals =
    core?.tokens.find((x) => x.chain === jar.chain && x.id === token1Name)?.decimals || 18;

  const token0Data = balances?.componentTokenBalances[token0Name];
  const token1Data = balances?.componentTokenBalances[token1Name];

  const depositToken0BalanceBN = BigNumber.from(token0Data?.balance || "0");
  const depositToken0Balance = parseFloat(
    ethers.utils.formatUnits(depositToken0BalanceBN, token0Decimals),
  );

  const depositToken1BalanceBN = BigNumber.from(token1Data?.balance || "0");
  const depositToken1Balance = parseFloat(
    ethers.utils.formatUnits(depositToken1BalanceBN, token1Decimals),
  );

  const pTokenBalanceBN = BigNumber.from(balances?.pAssetBalance || "0");

  const isFrax = token0Name === "frax" || token1Name === "frax";

  const transactionFactory = () => {
    if (!JarContract) return;

    const amount0 = ethers.utils.parseUnits(
      truncateToMaxDecimals(current.context.amount || "0"),
      token0Decimals,
    );

    const amount1 = ethers.utils.parseUnits(
      truncateToMaxDecimals(current.context.amount1 || "0"),
      token1Decimals,
    );

    // Non-Frax UniV3 jars have an extra bool argument for zapping
    const funcSig = `deposit(uint256,uint256${!isFrax ? ",bool" : ""})`;
    return () => JarContract[funcSig](amount0, amount1);
  };

  const callback = (receipt: ethers.ContractReceipt, dispatch: AppDispatch) => {
    if (!account) return;

    /**
     * This will generate three events:
     * 1) 2x Transfer of component tokens from user's wallet to the jar
     * 2) Mint of pTokens sent to user's wallet
     */
    const events = receipt.events?.filter(({ event }) => event === "Transfer") as TransferEvent[];
    const token0TransferEvent = events.find(
      (event) =>
        event.args.from === account &&
        event.address.toLowerCase() === jar.token0!.address.toLowerCase(),
    )!;
    const token1TransferEvent = events.find(
      (event) =>
        event.args.from === account &&
        event.address.toLowerCase() === jar.token1!.address.toLowerCase(),
    )!;

    const pTokenTransferEvent = events.find((event) => event.args.to === account)!;

    const newToken0Balance = depositToken0BalanceBN.sub(token0TransferEvent.args.value).toString();

    const newToken1Balance = depositToken1BalanceBN.sub(token1TransferEvent.args.value).toString();
    const pAssetBalance = pTokenBalanceBN.add(pTokenTransferEvent.args.value).toString();

    dispatch(
      UserActions.setTokenData({
        account,
        apiKey: jar.details.apiKey,
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
    const token0Price = core?.tokens.find((x) => x.id === token0Name)?.price || 0;
    const token1Price = core?.tokens.find((x) => x.id === token1Name)?.price || 0;

    if (!token0Price || !token1Price) return "$0";

    const valueUSD =
      parseFloat(current.context.amount) * token0Price +
      parseFloat(current.context.amount1 || "0") * token1Price;

    return `~ ${formatDollars(valueUSD)}`;
  };

  const enabled =
    isAcceptingDeposits(jar) && (depositToken0Balance > 0 || depositToken1Balance > 0);

  return (
    <>
      <Button
        type="primary"
        state={enabled ? "enabled" : "disabled"}
        onClick={() => {
          if (enabled) openModal();
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
          <FormUniV3
            balance0={depositToken0Balance}
            balance1={depositToken1Balance}
            jar={jar}
            nextStep={(amount: string, amount1: string) =>
              send(Actions.SUBMIT_FORM, { amount, amount1 })
            }
          />
        )}
        {current.matches(States.AWAITING_CONFIRMATION) && (
          <AwaitingConfirmationUniV3
            title={t("v2.farms.confirmDeposit")}
            cta={t("v2.actions.deposit")}
            token0Name={token0Name}
            token1Name={token1Name}
            amount0={current.context.amount}
            amount1={current.context.amount1 || "0"}
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

export default DepositFlowUniV3;
