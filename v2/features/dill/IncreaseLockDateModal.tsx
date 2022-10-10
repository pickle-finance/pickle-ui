import { FC, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { IUserDillStats } from "picklefinance-core/lib/client/UserModel";
import dayjs from "dayjs";
import { useMachine } from "@xstate/react";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { BigNumber } from "ethers";

import Button from "v2/components/Button";
import Modal from "v2/components/Modal";
import Error from "../farms/flows/Error";
import LockTimeOptions from "./LockTimeOptions";
import LockTimeSlider from "./LockTimeSlider";
import { estimateDillForDate, getDayOffset, getEpochSecondForDay } from "./flows/utils";
import { ArrowRightIcon } from "@heroicons/react/outline";
import { stateMachine, Actions, States } from "../farms/flows/stateMachineUserInput";
import Spinner from "v2/components/Spinner";
import { useDillContract } from "./flows/hooks";
import { sleep } from "v2/utils/waiting";
import { useAppDispatch } from "v2/store";
import { UserActions } from "v2/store/user";
import Link from "v2/components/Link";
import Ping from "../connection/Ping";
import { DILL_ADDRESS, shortenAddress } from "v2/utils";
import { ChainNetwork, Chains } from "picklefinance-core";
import { formatUnits } from "ethers/lib/utils";

interface Props {
  isOpen: boolean;
  closeModal: () => void;
  dill: IUserDillStats;
}

const IncreaseLockDateModal: FC<Props> = ({ isOpen, closeModal, dill }) => {
  const { t } = useTranslation("common");
  const [lockTime, setLockTime] = useState<Date>(getDayOffset(new Date(), 365 * 4 - 1));
  const [current, send] = useMachine(stateMachine);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>();
  const dispatch = useAppDispatch();
  const [progressStatus, setProgressStatus] = useState<string | undefined>(undefined);

  const urlPrefix = `${Chains.get(ChainNetwork.Ethereum).explorer}/tx/`;

  // Hack to skip straight to AWAITING_CONFIRMATION
  useEffect(() => {
    send(Actions.SUBMIT_FORM, { amount: null });
  }, [isOpen]);

  const { account } = useWeb3React<Web3Provider>();
  const DillContract = useDillContract(DILL_ADDRESS);

  if (!parseFloat(dill?.pickleLocked)) return <></>;
  if (!DillContract || !account) return null;

  const sendTransaction = async () => {
    setError(undefined);
    setIsWaiting(true);

    try {
      const lockTimeUnix = getEpochSecondForDay(lockTime);
      const transaction = await DillContract.increase_unlock_time(lockTimeUnix, {
        gasLimit: 410000,
      });

      send(Actions.TRANSACTION_SENT, { txHash: transaction.hash });
      setProgressStatus(t("v2.farms.waitingToBeProcessed"));

      transaction
        .wait()
        .then(
          async () => {
            while (true) {
              const newLock = await DillContract.locked__end(account);
              const success = newLock.gt(BigNumber.from(dill?.lockEnd || "0"));

              if (success) break;

              await sleep(1000);
            }

            dispatch(UserActions.refresh());
            send(Actions.SUCCESS);
            setProgressStatus(t("v2.farms.success"));
          },
          () => {
            send(Actions.FAILURE);
            setProgressStatus(t("v2.farms.transactionFailed"));
          },
        )
        .finally(() => setIsWaiting(false));
    } catch (error) {
      setError(error as Error);
      setIsWaiting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} closeModal={closeModal} title={t("v2.dill.increaseLockDate")}>
      <div className="mb-6">
        <LockTimeOptions setLockTime={setLockTime} dill={dill} />
        <LockTimeSlider lockTime={lockTime} setLockTime={setLockTime} dill={dill} />
      </div>
      <div className="flex justify-center pb-2">
        <span className={"text-foreground whitespace-pre font-medium text-base"}>
          {dayjs.unix(parseFloat(dill?.lockEnd)).format("LL")}
        </span>
        <ArrowRightIcon className="mx-4 pt-1 w-6 h-6 text-foreground-alt-200" />
        <span className="text-primary font-bold whitespace-pre text-base">
          {dayjs(lockTime).format("LL")}
        </span>
      </div>
      <div className="flex justify-center pb-6">
        <span className={"text-foreground whitespace-pre font-medium text-base"}>
          {parseFloat(formatUnits(dill.balance)).toFixed(3)} DILL
        </span>
        <ArrowRightIcon className="mx-4 pt-1 w-6 h-6 text-foreground-alt-200" />
        <span className="text-primary font-bold whitespace-pre text-base">
          ~
          {(
            estimateDillForDate(
              parseFloat(formatUnits(dill.pickleLocked)),
              lockTime,
              new Date(parseFloat(dill?.lockEnd) * 1000),
            ) + +parseFloat(formatUnits(dill.balance))
          ).toFixed(3)}{" "}
          DILL
        </span>
      </div>
      <Error error={error} />

      <Button
        state={isWaiting ? "disabled" : "enabled"}
        onClick={current.matches(States.SUCCESS) ? closeModal : sendTransaction}
      >
        {isWaiting && (
          <div className="w-5 h-5 mr-3">
            <Spinner />
          </div>
        )}
        {(current.matches(States.AWAITING_CONFIRMATION) ||
          current.matches(States.AWAITING_RECEIPT) ||
          current.matches(States.FAILURE)) &&
          t("v2.actions.confirm")}

        {current.matches(States.SUCCESS) && t("v2.actions.close")}
      </Button>
      {progressStatus && (
        <>
          <p className="text-foreground-alt-300 text-sm my-4">{progressStatus}</p>
          <div className="flex items-center justify-center space-x-3">
            {current.matches(States.AWAITING_RECEIPT) && <Ping />}
            <Link
              href={urlPrefix.concat(current.context.txHash || "")}
              external
              primary
              className="grow-0"
            >
              {shortenAddress(current.context.txHash || "")}
            </Link>
          </div>
        </>
      )}
    </Modal>
  );
};

export default IncreaseLockDateModal;
