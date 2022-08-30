import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import { IUserDillStats } from "picklefinance-core/lib/client/UserModel";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

import Modal from "v2/components/Modal";

import { useDillContract } from "./flows/hooks";
import { DILL_ADDRESS, formatDollars } from "v2/utils";
import { formatEther } from "ethers/lib/utils";
import { useSelector } from "react-redux";
import { CoreSelectors } from "v2/store/core";
import WithdrawFlow from "./flows/withdraw/DillWithdrawFlow";

interface Props {
  isOpen: boolean;
  closeModal: () => void;
  dill: IUserDillStats;
}

const WithdrawPicklesModal: FC<Props> = ({ isOpen, closeModal, dill }) => {
  const { t } = useTranslation("common");
  const [error, setError] = useState<Error | undefined>(); //probably add function to validate tx is possible

  const { account } = useWeb3React<Web3Provider>();
  const picklePrice = useSelector(CoreSelectors.selectPicklePrice);
  const DillContract = useDillContract(DILL_ADDRESS);
  const lockedPickleBalance = parseFloat(formatEther(dill.pickleLocked)).toFixed(2);
  const lockedPickleValue = formatDollars(parseFloat(formatEther(dill.pickleLocked)) * picklePrice);

  if (!parseFloat(dill?.pickleLocked)) return <></>;
  if (!DillContract || !account) return null;

  return (
    <Modal isOpen={isOpen} closeModal={closeModal} title={`${t("v2.actions.withdraw")} PICKLE`}>
      <div className="flex justify-center pb-6">
        <span className={"text-foreground whitespace-pre font-medium text-base"}>
          {`Lock expired on ${lockedPickleBalance} PICKLE (${lockedPickleValue})`}
        </span>
      </div>
      <WithdrawFlow visible={true} error={error} closeParentModal={closeModal} />
    </Modal>
  );
};

export default WithdrawPicklesModal;
