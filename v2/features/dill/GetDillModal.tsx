import { ChangeEvent, FC, useState } from "react";
import { useTranslation } from "next-i18next";
import { IUserDillStats, UserPickles } from "picklefinance-core/lib/client/UserModel";
import dayjs from "dayjs";

import Button from "v2/components/Button";
import Modal from "v2/components/Modal";
import LockTimeOptions from "./LockTimeOptions";
import { ChainNetwork } from "picklefinance-core";
import { formatEther } from "ethers/lib/utils";
import ApprovalFlow from "../farms/flows/approval/ApprovalFlow";
import DillDepositFlow from "./flows/deposit/DillDepositFlow";
import { estimateDillForDate, getDayOffset } from "./flows/utils";
import LockTimeSlider from "./LockTimeSlider";
import { DILL_ADDRESS, PICKLE_ADDRESS } from "v2/utils";

interface Props {
  isOpen: boolean;
  closeModal: () => void;
  pickles: UserPickles;
  dill: IUserDillStats;
}

const GetDillModal: FC<Props> = ({ isOpen, closeModal, pickles, dill }) => {
  const { t } = useTranslation("common");

  const [error, setError] = useState<Error | undefined>();
  const invalidAmountError = Error(t("v2.farms.invalidAmount"));

  const pickleBalanceStr = pickles[ChainNetwork.Ethereum]
    ? formatEther(pickles[ChainNetwork.Ethereum])
    : "0";

  const [amount, setAmount] = useState<string>(pickleBalanceStr);
  const [lockTime, setLockTime] = useState<Date>(getDayOffset(new Date(), 365 * 4 - 1));

  const validate = (value: string) => {
    if (!value) {
      setError(invalidAmountError);
      return;
    }

    const amount = parseFloat(value);
    const isValid = amount > 0 && amount <= parseFloat(pickleBalanceStr);

    isValid ? setError(undefined) : setError(invalidAmountError);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setAmount(value);
    validate(value);
  };

  const userHasDillAllowance = parseInt(dill?.dillApproval || "0") > 0;

  return (
    <Modal
      isOpen={isOpen}
      closeModal={closeModal}
      title={Boolean(dill.balance) ? t("v2.dill.addDill") : t("v2.dill.getDill")}
    >
      <div className="bg-background-lightest rounded-xl px-4 py-2">
        <div className="flex justify-between mb-2">
          <p className="font-bold text-foreground-alt-300 text-xs tracking-normal leading-4">
            {t("v2.balances.amount")}
          </p>
          <p className="font-bold text-foreground-alt-300 text-xs tracking-normal leading-4">
            {t("v2.dill.pickleBalance")}: {parseFloat(pickleBalanceStr).toFixed(4)}
          </p>
        </div>

        <div className="flex justify-between">
          <input
            type="number"
            className="w-3/5 bg-transparent focus:outline-none flex-shrink-0 font-medium text-primary leading-7"
            value={amount}
            onChange={handleChange}
          />
          <Button
            size="small"
            onClick={() => {
              setAmount(pickleBalanceStr);
              validate(pickleBalanceStr);
            }}
          >
            {t("v2.balances.max")}
          </Button>{" "}
        </div>
      </div>

      <div className="my-6">
        {!parseFloat(dill.balance) && (
          <>
            <LockTimeOptions showValue setLockTime={setLockTime} />
            <LockTimeSlider lockTime={lockTime} setLockTime={setLockTime} dill={dill} />
            <p className="text-foreground-alt-200 text-sm mb-4">
              {" "}
              {t("v2.dill.lockingUntil")}{" "}
              <span className="font-title text-primary text-base mr-2">
                {dayjs(lockTime).format("LL")}
              </span>
            </p>

            <p className={"text-foreground-alt-200 text-sm mb-4"}>
              {t("v2.dill.estimatedDill")}{" "}
              <span className={"font-title text-primary text-base mr-2"}>
                {estimateDillForDate(parseFloat(amount), lockTime).toFixed(3)} DILL
              </span>
            </p>
          </>
        )}
      </div>
      <ApprovalFlow
        tokenAddress={PICKLE_ADDRESS}
        tokenName={"PICKLE"}
        spenderAddress={DILL_ADDRESS}
        storeAttribute="dillApproval"
        chainName={ChainNetwork.Ethereum}
        visible={!userHasDillAllowance}
        state="enabled"
        type="dill"
      />
      <DillDepositFlow
        visible={userHasDillAllowance}
        lockTime={lockTime}
        userInput={amount}
        error={error}
        dillBalance={+dill.balance}
        closeParentModal={closeModal}
      />
    </Modal>
  );
};

export default GetDillModal;
