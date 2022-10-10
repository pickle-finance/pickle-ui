import { FC, useEffect, useState } from "react";
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
import dayjs from "dayjs";

const WithdrawPicklesModal: FC<Props> = ({ isOpen, closeModal, dill }) => {
  const { t } = useTranslation("common");
  const [error, setError] = useState<Error | undefined>();
  const invalidBalance = Error(t("v2.dill.invalidBalance"));

  const { account } = useWeb3React<Web3Provider>();
  const picklePrice = useSelector(CoreSelectors.selectPicklePrice);
  const DillContract = useDillContract(DILL_ADDRESS);
  const nLockedPickles = parseFloat(formatEther(dill.pickleLocked)).toFixed(2);
  const lockedPickleValue = formatDollars(parseFloat(formatEther(dill.pickleLocked)) * picklePrice);
  const lockEnd = parseFloat(dill?.lockEnd) ? dayjs.unix(parseFloat(dill?.lockEnd)) : undefined;
  const unlockDate = dayjs(lockEnd);

  const validate = () => {
    const isValid = +nLockedPickles > 0;
    isValid ? setError(undefined) : setError(invalidBalance);
  };
  useEffect(() => validate(), [dill]);

  if (!parseFloat(dill?.pickleLocked)) return <></>;
  if (!DillContract || !account) return null;

  return (
    <Modal isOpen={isOpen} closeModal={closeModal} title={`${t("v2.actions.withdraw")} PICKLEs`}>
      <div className="flex justify-center pb-6">
        <span className={"text-foreground whitespace-wrap font-medium text-base"}>
          {t("v2.dill.withdrawModalText", {
            unlockDate: dayjs(unlockDate).format("LL"),
            nPickles: nLockedPickles,
            pickleValue: lockedPickleValue,
          })}
        </span>
      </div>
      <WithdrawFlow visible={true} dill={dill} error={error} closeParentModal={closeModal} />
    </Modal>
  );
};

interface Props {
  isOpen: boolean;
  closeModal: () => void;
  dill: IUserDillStats;
}

export default WithdrawPicklesModal;
