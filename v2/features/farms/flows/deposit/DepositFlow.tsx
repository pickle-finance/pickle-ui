import { FC, useMemo, useState } from "react";
import { useTranslation } from "next-i18next";
import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { useMachine } from "@xstate/react";
import { useSelector } from "react-redux";

// TODO: use pf-core files when they're included in the distribution
import { Jar__factory as JarFactory } from "containers/Contracts/factories/Jar__factory";
import { Jar } from "containers/Contracts/Jar";

import Button from "v2/components/Button";
import Modal from "v2/components/Modal";
import { CoreSelectors, JarWithData } from "v2/store/core";
import { stateMachine, Actions, States } from "../stateMachineUserInput";
import Form from "./Form";

interface Props {
  jar: JarWithData;
  visible: boolean;
  depositTokenBalance: number;
}

const DepositFlow: FC<Props> = ({ jar, visible, depositTokenBalance }) => {
  const { t } = useTranslation("common");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>();
  const [current, send] = useMachine(stateMachine);
  const core = useSelector(CoreSelectors.selectCore);
  const chain = core?.chains.find((chain) => chain.network === jar.chain);

  const { library } = useWeb3React<Web3Provider>();

  const { contract } = jar;

  const jarContract = useMemo<Jar | undefined>(() => {
    if (!library) return;

    return JarFactory.connect(contract, library.getSigner());
  }, [library, contract]);

  if (!jarContract) return null;

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
        <Button type="secondary" state="disabled" className="w-11">
          -
        </Button>
      </div>
      <Modal
        isOpen={isModalOpen}
        closeModal={closeModal}
        title={t("v2.farms.depositToken", { token: jar.depositToken.name })}
      >
        {current.matches(States.FORM) && <Form tokenBalance={depositTokenBalance} />}
      </Modal>
    </>
  );
};

export default DepositFlow;
