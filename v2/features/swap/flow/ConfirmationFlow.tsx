import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import Modal from "v2/components/Modal";
import { LoadingErrorHandler } from "../SwapMainCard";
import { useInterval } from "../hooks";
import { ApiOrderStatus } from "@cowprotocol/cow-sdk";
import PendingSwapOrder from "../PendingSwapOrder";
import { COW_SWAP_EXPLORER } from "../constants";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import SuccessSwap from "../SuccessSwap";
import FailureSwap from "../FailureSwap";
import AwaitingOrderConfirmation from "../AwaitingOrderConfirmation";
import { SwapButtons } from "../SwapButtons";

const ConfirmationFlow: FC<{
  mainFunc: () => Promise<string | undefined>;
  pendingFunc: (orderId: string) => Promise<ApiOrderStatus | undefined>;
}> = ({ mainFunc, pendingFunc }) => {
  const { t } = useTranslation("common");
  const { chainId } = useWeb3React<Web3Provider>();
  const exp = COW_SWAP_EXPLORER[chainId?.toString() || "1"];
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [swapIdData, setSwapIdData] = useState<LoadingErrorHandler<string>>({
    data: "",
    isLoading: false,
    error: "",
  });
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async () => {
    setError("");
    setIsPending(false);
    setSwapIdData({
      data: "",
      error: "",
      isLoading: true,
    });
    try {
      const swapId = await mainFunc();
      setSwapIdData({
        data: swapId ?? "",
        error: "",
        isLoading: false,
      });
      setIsPending(true);
    } catch (err: any) {
      setSwapIdData({
        data: "",
        error: err?.message,
        isLoading: false,
      });
    }
  };

  const openModal = async () => {
    setIsModalOpen(true);
    await onSubmit();
  };
  const closeModal = () => setIsModalOpen(false);

  useInterval(
    async () => {
      try {
        const pending = await pendingFunc(swapIdData.data);
        if (pending === "fulfilled") {
          setIsPending(false);
        }
        if (pending === "expired" || pending === "cancelled") {
          throw new Error(`Order is ${pending}`);
        }
        setError("");
      } catch (err: any) {
        setIsPending(false);
        setError(err?.message ?? "Error Occurred");
      }
    },
    isPending ? 5 * 1000 : null,
  );

  return (
    <>
      <SwapButtons type="button" onClick={openModal}>
        {t("v2.actions.approve")}
      </SwapButtons>
      <Modal isOpen={isModalOpen} closeModal={closeModal} title={"Creating Order"}>
        {isPending ? (
          <PendingSwapOrder orderId={swapIdData.data ?? ""} explorer={exp} />
        ) : !!error ? (
          <FailureSwap
            explorer={exp}
            orderId={swapIdData.data ?? ""}
            message={undefined}
            retry={onSubmit}
          />
        ) : swapIdData.isLoading ? (
          <AwaitingOrderConfirmation />
        ) : !!swapIdData.data ? (
          <SuccessSwap closeModal={closeModal} explorer={exp} orderId={swapIdData.data ?? ""} />
        ) : (
          !!swapIdData.error && (
            <FailureSwap
              explorer={undefined}
              orderId={undefined}
              message={swapIdData.error}
              retry={() => {}}
            />
          )
        )}
      </Modal>
    </>
  );
};

export default ConfirmationFlow;
