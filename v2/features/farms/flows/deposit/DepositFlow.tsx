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

interface Props {
  jar: JarWithData;
  visible: boolean;
}

const DepositFlow: FC<Props> = ({ jar, visible }) => {
  const { t } = useTranslation("common");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>();
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

  const sendTransaction = async () => {
    setError(undefined);

    try {
      const transaction = await jarContract.approve(contract, ethers.constants.MaxUint256);
      await transaction.wait().then(
        () => {},
        (tx) => {},
      );
    } catch (error) {
      setError(error as Error);
    }
  };

  if (!visible) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button type="secondary" state="disabled" className="w-11">
        +
      </Button>
      <Button type="secondary" state="disabled" className="w-11">
        -
      </Button>
    </div>
  );
};

export default DepositFlow;
