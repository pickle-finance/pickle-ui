import { FC, useMemo, useState } from "react";
import { useTranslation } from "next-i18next";
import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { useMachine } from "@xstate/react";
import { useSelector } from "react-redux";

// TODO: use pf-core files when they're included in the distribution
import { Erc20__factory as Erc20Factory } from "containers/Contracts/factories/Erc20__factory";
import { Erc20 } from "containers/Contracts/Erc20";

import { useAppDispatch } from "v2/store";
import Button from "v2/components/Button";
import Modal from "v2/components/Modal";
import { CoreSelectors, JarWithData } from "v2/store/core";
import { UserActions } from "v2/store/user";
import { stateMachine, Actions, States } from "../stateMachineNoUserInput";
import AwaitingConfirmation from "./AwaitingConfirmation";
import AwaitingReceipt from "./AwaitingReceipt";
import Success from "./Success";
import Failure from "./Failure";

interface Props {
  jar: JarWithData;
  visible: boolean;
}

const ApprovalFlow: FC<Props> = ({ jar, visible }) => {
  const { t } = useTranslation("common");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>();
  const core = useSelector(CoreSelectors.selectCore);
  const [current, send] = useMachine(stateMachine);
  const dispatch = useAppDispatch();
  const { library } = useWeb3React<Web3Provider>();

  const chain = core?.chains.find((chain) => chain.network === jar.chain);

  const { contract } = jar;

  const TokenContract = useMemo<Erc20 | undefined>(() => {
    if (!library) return;

    return Erc20Factory.connect(jar.depositToken.addr, library.getSigner());
  }, [library, contract]);

  if (!TokenContract) return null;

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    dispatch(UserActions.refresh());
    setIsModalOpen(false);
  };

  const sendTransaction = async () => {
    setError(undefined);
    setIsWaiting(true);

    try {
      const amount = ethers.constants.MaxUint256;
      const transaction = await TokenContract.approve(contract, amount);

      send(Actions.TRANSACTION_SENT, { txHash: transaction.hash });

      await transaction
        .wait()
        .then(
          () => {
            send(Actions.SUCCESS);
            // Optimistic UI update.
            dispatch(
              UserActions.setTokenAllowance({
                apiKey: jar.details.apiKey,
                value: amount.toString(),
              }),
            );
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

  return (
    <>
      {visible && <Button onClick={openModal}>{t("v2.actions.approve")}</Button>}
      <Modal
        isOpen={isModalOpen}
        closeModal={closeModal}
        title={t("v2.farms.approveToken", { token: jar.depositToken.name })}
      >
        {current.matches(States.AWAITING_CONFIRMATION) && (
          <AwaitingConfirmation
            tokenName={jar.depositToken.name}
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
            retry={() => send(Actions.RETRY)}
          />
        )}
      </Modal>
    </>
  );
};

export default ApprovalFlow;
