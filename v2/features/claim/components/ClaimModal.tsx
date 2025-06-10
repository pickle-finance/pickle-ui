import { FC, useState } from "react";
import Modal from "v2/components/Modal";
import { useTranslation } from "next-i18next";
import { ethers } from "ethers";
import Image from "next/image";

interface ClaimModalProps {
  isOpen: boolean;
  closeModal: () => void;
  claimData: {
    account: string;
    amount: string;
    proof: string[];
    contractAddress: string;
    contractABI: any;
    library: any;
    tokenDecimals: number;
    etherscanBaseUrl: string;
  } | null;
  onClaimed?: (txHash: string) => void;
}

type ModalState = "CONFIRM" | "LOADING" | "SUCCESS" | "ERROR";

const ClaimModal: FC<ClaimModalProps> = ({ isOpen, closeModal, claimData, onClaimed }) => {
  const { t } = useTranslation("common");
  const [modalState, setModalState] = useState<ModalState>("CONFIRM");
  const [txHash, setTxHash] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleConfirm = async () => {
    if (!claimData) return;
    setModalState("LOADING");
    setErrorMessage("");
    setTxHash("");
    try {
      const contract = new ethers.Contract(
        claimData.contractAddress,
        claimData.contractABI,
        claimData.library.getSigner(),
      );
      // Verify eligibility (optional, can be removed if already checked)
      const isEligible = await contract.isEligible(
        claimData.account,
        claimData.amount,
        claimData.proof,
      );
      if (!isEligible) {
        setErrorMessage("Your claim could not be verified. Please contact support.");
        setModalState("ERROR");
        return;
      }
      // Submit claim transaction
      const tx = await contract.claim(claimData.amount, claimData.proof);
      setTxHash(tx.hash);
      // Wait for transaction to be mined
      await tx.wait();
      setModalState("SUCCESS");
      if (onClaimed) onClaimed(tx.hash);
    } catch (error: any) {
      if (error.code === 4001) {
        setErrorMessage("Transaction was rejected. Please try again.");
      } else if (error.data?.message) {
        setErrorMessage(`Contract error: ${error.data.message}`);
      } else if (error.message) {
        setErrorMessage(`Error: ${error.message.split("\n")[0]}`);
      } else {
        setErrorMessage("Failed to claim tokens. Please try again.");
      }
      setModalState("ERROR");
    }
  };

  const resetAndClose = () => {
    setModalState("CONFIRM");
    setErrorMessage("");
    setTxHash("");
    closeModal();
  };

  // UI for each modal state
  let content;
  if (!claimData) {
    content = <div className="text-center text-foreground">No claim data found.</div>;
  } else if (modalState === "CONFIRM") {
    content = (
      <div className="flex flex-col items-center text-center">
        <img src="/animations/working.gif" width={120} height={120} alt="Pickle Working" />
        <h2 className="mt-4 mb-2 text-lg font-bold text-foreground-alt-100">
          {t("v2.claim.confirmTitle", "Confirm Claim")}
        </h2>
        <p className="mb-4 text-foreground-alt-200">
          {t("v2.claim.confirmDesc", "You are about to claim:")}
        </p>
        <div className="mb-4 text-2xl font-mono text-primary">
          {ethers.utils.formatUnits(claimData.amount, claimData.tokenDecimals)} USDC
        </div>
        <button
          className="p-3 rounded-xl bg-accent text-foreground-button font-bold w-full mt-2"
          onClick={handleConfirm}
        >
          {t("v2.claim.confirmButton", "Claim USDC")}
        </button>
      </div>
    );
  } else if (modalState === "LOADING") {
    content = (
      <div className="flex flex-col items-center text-center">
        <img src="/animations/waiting.gif" width={120} height={120} alt="Pickle Waiting" />
        <h2 className="mt-4 mb-2 text-lg font-bold text-foreground-alt-100">
          {t("v2.claim.processing", "Waiting for your transaction to be processed")}
        </h2>
        {txHash && (
          <div className="mt-4 text-sm text-accent flex items-center gap-2">
            <span className="w-2 h-2 bg-accent rounded-full inline-block" />
            <a
              href={`${claimData.etherscanBaseUrl}${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {txHash.slice(0, 6)}...{txHash.slice(-4)}
            </a>
          </div>
        )}
      </div>
    );
  } else if (modalState === "SUCCESS") {
    content = (
      <div className="flex flex-col items-center text-center">
        <img src="/animations/success.gif" width={120} height={120} alt="Pickle Success" />
        <h2 className="mt-4 mb-2 text-lg font-bold text-foreground-alt-100">
          {t("v2.claim.success", "Success!")}
        </h2>
        <div className="mb-4 text-2xl font-mono text-primary">
          {ethers.utils.formatUnits(claimData.amount, claimData.tokenDecimals)} USDC
        </div>
        <div className="mt-2 text-sm text-accent flex items-center gap-2">
          <span className="w-2 h-2 bg-accent rounded-full inline-block" />
          <a
            href={`${claimData.etherscanBaseUrl}${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {txHash.slice(0, 6)}...{txHash.slice(-4)}
          </a>
        </div>
        <button
          className="p-3 rounded-xl bg-accent text-foreground-button font-bold w-full mt-6"
          onClick={resetAndClose}
        >
          {t("common.close", "Close")}
        </button>
      </div>
    );
  } else if (modalState === "ERROR") {
    content = (
      <div className="flex flex-col items-center text-center">
        <img src="/animations/failure.gif" width={120} height={120} alt="Pickle Error" />
        <h2 className="mt-4 mb-2 text-lg font-bold text-foreground-alt-100">
          {t("v2.claim.error", "Error")}
        </h2>
        <div className="mb-4 font-mono text-foreground-alt-200 text-lg font-medium">
          {errorMessage}
        </div>
        <button
          className="p-3 rounded-xl bg-accent text-foreground-button font-bold w-full mt-6"
          onClick={resetAndClose}
        >
          {t("common.close", "Close")}
        </button>
      </div>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      closeModal={resetAndClose}
      title={t("v2.claim.claimUSDC", "Claim USDC")}
      size="wide"
    >
      {content}
    </Modal>
  );
};

export default ClaimModal;
