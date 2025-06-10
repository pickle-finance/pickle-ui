import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { useTranslation } from "next-i18next";
import type { NextPage } from "next";
import Image from "next/image";
import { CashIcon } from "@heroicons/react/solid";

import { CoreSelectors } from "v2/store/core";
import { useAppSelector } from "v2/store";
import ClaimModal from "./components/ClaimModal";
import Link from "v2/components/Link";

// Contract ABI for the PickleDistribution contract
const CONTRACT_ABI = [
  "function claim(uint256 amount, bytes32[] calldata merkleProof) external",
  "function isEligible(address account, uint256 amount, bytes32[] calldata merkleProof) external view returns (bool)",
  "function claimed(address) external view returns (bool)",
  "function isDistributionActive() external view returns (bool)",
  "function token() external view returns (address)",
];

// ERC20 ABI for USDC
const ERC20_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
];

// Configuration
const CONFIG = {
  chainId: 1, // Ethereum Mainnet
  contractAddress: "0x34397E25dE78931efDd48fa8EC9330217A2EB344", // Test distribution contract
  distributionDataUrl: "/distribution.json", // URL to fetch distribution data
  tokenDecimals: 6, // USDC has 6 decimals
  etherscanBaseUrl: "https://etherscan.io/tx/", // Base URL for Etherscan transactions
};

const Claim: NextPage = () => {
  const { t } = useTranslation("common");
  const { account, library } = useWeb3React();
  const [distributionData, setDistributionData] = useState<any>(null);
  const [userClaimData, setUserClaimData] = useState<any>(null);
  const [claimStatus, setClaimStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isDistributionActive, setIsDistributionActive] = useState<boolean>(true);
  const [contractBalance, setContractBalance] = useState<string>("0");
  const [tokenSymbol, setTokenSymbol] = useState<string>("USDC");
  const [txHash, setTxHash] = useState<string>("");
  const [justClaimed, setJustClaimed] = useState<boolean>(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  const core = useAppSelector(CoreSelectors.selectCore);

  // Fetch distribution data and contract info
  useEffect(() => {
    const fetchDistributionData = async () => {
      try {
        const response = await fetch(CONFIG.distributionDataUrl);
        if (response.ok) {
          const data = await response.json();
          setDistributionData(data);
        } else {
          setErrorMessage("Failed to load distribution data. Please try again later.");
        }
      } catch (error) {
        setErrorMessage("Failed to load distribution data. Please try again later.");
      }
    };

    fetchDistributionData();
  }, []);

  // Check contract token balance
  useEffect(() => {
    const checkContractBalance = async () => {
      if (!library) return;

      try {
        const contract = new ethers.Contract(CONFIG.contractAddress, CONTRACT_ABI, library);

        // Get token address
        const tokenAddress = await contract.token();

        // Get token info
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, library);

        const decimals = await tokenContract.decimals();
        const symbol = await tokenContract.symbol();
        const balance = await tokenContract.balanceOf(CONFIG.contractAddress);

        setTokenSymbol(symbol);
        setContractBalance(ethers.utils.formatUnits(balance, decimals));
      } catch (error) {
        console.error("Error checking contract balance:", error);
      }
    };

    checkContractBalance();
  }, [library]);

  // Check user's claim status when account changes
  useEffect(() => {
    if (account && distributionData && distributionData.claims) {
      const userAddress = account.toLowerCase();
      const claimData = distributionData.claims[userAddress];

      setUserClaimData(claimData);

      if (library && claimData) {
        checkClaimStatus();
      }
    }
  }, [account, distributionData, library]);

  // Check if the claim is already made
  const checkClaimStatus = async () => {
    if (!account || !library) return;

    try {
      const contract = new ethers.Contract(
        CONFIG.contractAddress,
        CONTRACT_ABI,
        library.getSigner(),
      );

      // Check if distribution is active
      const isActive = await contract.isDistributionActive();
      setIsDistributionActive(isActive);

      if (!isActive) {
        setErrorMessage("The distribution period has not started or has already ended.");
        return;
      }

      // Check if already claimed
      const isClaimed = await contract.claimed(account);
      setClaimStatus(isClaimed ? "Claimed" : "Not Claimed");
    } catch (error) {
      console.error("Error checking claim status:", error);
      setErrorMessage("Failed to check claim status. Please try again.");
    }
  };

  // Prepare claim modal data
  const claimModalData =
    account && userClaimData
      ? {
          account,
          amount: userClaimData.amount,
          proof: userClaimData.proof,
          contractAddress: CONFIG.contractAddress,
          contractABI: CONTRACT_ABI,
          library,
          tokenDecimals: CONFIG.tokenDecimals,
          etherscanBaseUrl: CONFIG.etherscanBaseUrl,
        }
      : null;

  // Format the claim amount for display
  const formatClaimAmount = (amount: string) => {
    if (!amount) return "0";
    return ethers.utils.formatUnits(amount, CONFIG.tokenDecimals);
  };

  // Function to open wallet connection modal
  const handleConnectWallet = () => {
    // This will trigger the wallet connection modal
    const connectButton = document.querySelector('button[title="Connect Wallet"]');
    if (connectButton) {
      (connectButton as HTMLButtonElement).click();
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mt-8 grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        <div className="bg-background-light rounded-xl border border-foreground-alt-500 shadow w-full">
          <div className="px-6 py-4 border-b border-foreground-alt-500">
            <div className="flex justify-between items-center">
              <h2 className="font-title font-medium text-xl">Claim Your USDC</h2>
            </div>
          </div>
          <div>
            <div className="p-4 space-y-6">
              {!account ? (
                <div className="text-center py-6">
                  <p className="mb-4 text-foreground-alt-200">
                    Connect your wallet to check your claim eligibility
                  </p>
                  <div className="inline-block">
                    <a
                      className="p-4 rounded-2xl leading-3 text-foreground-button bg-accent border-transparent cursor-pointer hover:bg-accent-light inline-flex justify-center items-center border-2 text-sm font-bold shadow-sm focus:outline-none transition duration-300 ease-in-out"
                      onClick={handleConnectWallet}
                    >
                      Connect Wallet
                    </a>
                  </div>
                </div>
              ) : !userClaimData ? (
                <div className="text-center py-6">
                  <p className="mb-4 text-foreground-alt-200">
                    No eligible claim found for address:{" "}
                    <strong className="font-mono">{account}</strong>
                    <br />
                    <br />
                    Make sure you are connected with the wallet that held PICKLE or DILL tokens at
                    the time of the snapshot.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground-alt-200">Eligible Amount:</span>
                    <span className="font-medium text-xl">
                      {formatClaimAmount(userClaimData.amount)} USDC
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground-alt-200">Status:</span>
                    <span
                      className={`font-medium ${
                        claimStatus === "Claimed" ? "text-green-500" : "text-foreground"
                      }`}
                    >
                      {claimStatus === "Claimed"
                        ? justClaimed
                          ? "Claimed!"
                          : "Already Claimed"
                        : claimStatus}
                    </span>
                  </div>
                  <div className="inline-block">
                    <a
                      className={`p-4 rounded-2xl leading-3 ${
                        claimStatus === "Claimed" || isLoading || !isDistributionActive
                          ? "bg-foreground-alt-400 text-foreground-alt-300 border-transparent pointer-events-none"
                          : "text-foreground-button bg-accent border-transparent cursor-pointer hover:bg-accent-light"
                      } inline-flex justify-center items-center border-2 text-sm font-bold shadow-sm focus:outline-none transition duration-300 ease-in-out w-full`}
                      onClick={
                        claimStatus === "Claimed" || isLoading || !isDistributionActive
                          ? undefined
                          : () => setIsClaimModalOpen(true)
                      }
                    >
                      {isLoading
                        ? "Processing..."
                        : claimStatus === "Claimed" && justClaimed
                        ? "Claimed!"
                        : claimStatus === "Claimed"
                        ? "Already Claimed"
                        : "Claim USDC"}
                    </a>
                  </div>
                  <ClaimModal
                    isOpen={isClaimModalOpen}
                    closeModal={() => setIsClaimModalOpen(false)}
                    claimData={claimModalData}
                    onClaimed={(tx) => {
                      setTxHash(tx);
                      setJustClaimed(true);
                      setClaimStatus("Claimed");
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-background-light rounded-xl border border-foreground-alt-500 shadow w-full">
          <div className="px-6 py-4 border-b border-foreground-alt-500">
            <h2 className="font-title font-medium text-xl">Sunset Information</h2>
          </div>
          <div>
            <div className="p-4 space-y-4">
              <div className="flex flex-col items-center justify-center mb-4">
                <div className="w-full h-48 relative">
                  <Image
                    src="/closing-trans.png"
                    alt="Pickle Finance"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </div>

              <div className="text-md text-foreground-alt-200">
                <p className="mb-2">After almost 5 years, Pickle Finance is shutting down.</p>
                <p className="mb-2">
                  <strong>Important information:</strong>
                </p>
                <ul className="list-disc pl-4 mb-2 space-y-1">
                  <li>
                    All remaining treasury funds (170,280 USDC) will be distributed proportionally
                    to PICKLE and DILL token holders.
                  </li>
                  <li>
                    Only users with a PICKLE (could be locked in DILL) <strong>balance > 300</strong>{" "}
                    are eligible.
                  </li>
                  <li>
                    Please withdraw all funds from Pickle Jars{" "}
                    <strong>before September, 2025</strong>, as the the frontend will be shut down.
                  </li>
                </ul>
                <p>
                  See this{" "}
                  <Link
                    primary
                    external
                    className="font-bold"
                    href="https://medium.com/@picklefinance/pickle-finance-sunset-information-642554500000"
                  >
                    Blog Post
                  </Link>{" "}
                  for more information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Claim;
