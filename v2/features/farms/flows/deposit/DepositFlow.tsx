import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import { useMachine } from "@xstate/react";
import { BigNumber, ethers } from "ethers";
import { useSelector } from "react-redux";
import { UserTokenData } from "picklefinance-core/lib/client/UserModel";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

import Button from "v2/components/Button";
import Modal from "v2/components/Modal";
import { CoreSelectors, JarWithData } from "v2/store/core";
import { stateMachine, Actions, States } from "../stateMachineUserInput";
import Form from "./Form";
import { jarDecimals } from "v2/utils/user";
import AwaitingConfirmation from "../deposit/AwaitingConfirmation";
import { useAppDispatch } from "v2/store";
import AwaitingReceipt from "../AwaitingReceipt";
import Success from "../Success";
import Failure from "../Failure";
import { useJarContract } from "../hooks";
import { sleep } from "v2/utils";
import { UserActions } from "v2/store/user";
import { ThemeActions } from "v2/store/theme";

interface Props {
  jar: JarWithData;
  visible: boolean;
  balances: UserTokenData | undefined;
}

const DepositFlow: FC<Props> = ({ jar, visible, balances }) => {
  const { t } = useTranslation("common");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>();
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>(t("v2.farms.transactionPending"));
  const [current, send] = useMachine(stateMachine);
  const core = useSelector(CoreSelectors.selectCore);
  const dispatch = useAppDispatch();
  const chain = core?.chains.find((chain) => chain.network === jar.chain);

  const { contract } = jar;
  const decimals = jarDecimals(jar);
  const depositTokenBalanceBN = BigNumber.from(balances?.depositTokenBalance || "0");
  const depositTokenBalance = parseFloat(ethers.utils.formatUnits(depositTokenBalanceBN, decimals));
  const pAssetTokenBalance = parseFloat(
    ethers.utils.formatUnits(balances?.pAssetBalance || "0", 18),
  );

  const { account } = useWeb3React<Web3Provider>();
  const JarContract = useJarContract(contract);

  if (!JarContract || !account) return null;

  const sendTransaction = async () => {
    setError(undefined);
    setIsWaiting(true);

    try {
      const amountBN = ethers.utils.parseUnits(current.context.amount.toString(), decimals);
      const pAssetBalanceBN = BigNumber.from(balances?.pAssetBalance || "0");

      const transaction = await JarContract.deposit(amountBN);

      send(Actions.TRANSACTION_SENT, { txHash: transaction.hash });

      transaction
        .wait()
        .then(
          async () => {
            setProgressStatus(t("v2.farms.waitingForBlockConfirmation"));

            while (true) {
              const balance = await JarContract.balanceOf(account);

              const success = balance.gt(pAssetBalanceBN);

              if (success) break;

              await sleep(1000);
            }

            dispatch(UserActions.refresh());

            send(Actions.SUCCESS);
            dispatch(ThemeActions.setIsConfettiOn(true));
          },
          () => {
            send(Actions.FAILURE);
          },
        )
        .finally(() => setIsWaiting(false));
    } catch (error) {
      setError(error as Error);
      setIsWaiting(false);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  if (!visible) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
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
        <Button
          type="secondary"
          state={pAssetTokenBalance > 0 ? "enabled" : "disabled"}
          className="w-11"
        >
          -
        </Button>
      </div>
      <Modal
        isOpen={isModalOpen}
        closeModal={closeModal}
        title={t("v2.farms.depositToken", { token: jar.depositToken.name })}
      >
        {current.matches(States.FORM) && (
          <Form
            depositTokenBalance={depositTokenBalance}
            nextStep={(amount: string) => send(Actions.SUBMIT_FORM, { amount })}
          />
        )}
        {current.matches(States.AWAITING_CONFIRMATION) && (
          <AwaitingConfirmation
            tokenName={jar.depositToken.name}
            amount={current.context.amount}
            depositTokenPrice={jar.depositToken.price}
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
          <AwaitingReceipt
            chainExplorer={chain?.explorer}
            txHash={current.context.txHash}
            progressStatus={progressStatus}
          />
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
            retry={() => send(Actions.RETRY)}
          />
        )}
      </Modal>
    </>
  );
};

export default DepositFlow;
