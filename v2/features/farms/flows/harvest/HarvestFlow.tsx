import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import { BigNumber, ethers } from "ethers";
import { useMachine } from "@xstate/react";
import { useSelector } from "react-redux";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { ChainNetwork } from "picklefinance-core";

import Button, { ButtonSize, ButtonType } from "v2/components/Button";
import Modal from "v2/components/Modal";
import { stateMachine, Actions, States } from "../stateMachineNoUserInput";
import AwaitingConfirmationNoUserInput from "../AwaitingConfirmationNoUserInput";
import AwaitingReceipt from "../AwaitingReceipt";
import Success from "../Success";
import Failure from "../Failure";
import { useFarmContract, useTransaction } from "../hooks";
import { AppDispatch } from "v2/store";
import { UserActions } from "v2/store/user";
import { eventsByName } from "../utils";
import { CoreSelectors } from "v2/store/core";
import { Asset, farmDetails } from "v2/store/core.helpers";
import { Gauge, RewardPaidEvent } from "containers/Contracts/Gauge";
import { HarvestEvent, Minichef } from "containers/Contracts/Minichef";
import MoreInfo from "v2/components/MoreInfo";
import { FEE_DISTRIBUTOR_ADDRESS, formatDollars, roundToSignificantDigits } from "v2/utils";
import { useDistributorContract } from "v2/features/dill/flows/hooks";
import { ClaimedEvent } from "containers/Contracts/FeeDistributor";
import ConnectButton from "../../ConnectButton";
import { useNeedsNetworkSwitch } from "v2/hooks";

export type Rewarder = "farm" | "dill";

interface Props {
  asset?: Asset | undefined;
  buttonSize?: ButtonSize;
  buttonType?: ButtonType;
  harvestableAmount: BigNumber;
  network: ChainNetwork;
  rewarderType: Rewarder;
  showNetworkSwitch?: boolean;
}

/**
 * This flow is designed to work with both jars and dill. Asset will not be provided when
 * harvesting dill rewards.
 */
const HarvestFlow: FC<Props> = ({
  asset,
  buttonSize,
  buttonType,
  harvestableAmount,
  network,
  rewarderType,
  showNetworkSwitch,
}) => {
  const { t } = useTranslation("common");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const core = useSelector(CoreSelectors.selectCore);
  const picklePrice = useSelector(CoreSelectors.selectPicklePrice);
  const [current, send] = useMachine(stateMachine);
  const { account } = useWeb3React<Web3Provider>();
  const { network: jarNetwork, needsNetworkSwitch } = useNeedsNetworkSwitch(network);

  const chain = core?.chains.find((chain) => chain.network === network);

  const FarmContract = useFarmContract(farmDetails(asset)?.farmAddress, chain);
  const DistributorContract = useDistributorContract(FEE_DISTRIBUTOR_ADDRESS);
  const picklePendingAmount = parseFloat(ethers.utils.formatEther(harvestableAmount));

  const transactionFactory = () => {
    if (!account) return;

    // Farm rewards
    if (rewarderType === "farm") {
      if (!FarmContract) return;

      if (network === ChainNetwork.Ethereum) return () => (FarmContract as Gauge).getReward();

      const poolId = farmDetails(asset)?.details?.poolId;
      if (poolId === undefined) return;

      return () => (FarmContract as Minichef).harvest(poolId, account);
    }

    // Dill rewards
    if (!DistributorContract) return;

    return () => DistributorContract["claim()"]();
  };

  const callback = (receipt: ethers.ContractReceipt, dispatch: AppDispatch) => {
    if (!account) return;

    let pickles: BigNumber = BigNumber.from(0);

    // Farm rewards
    if (rewarderType === "farm") {
      if (!asset) return;

      if (network === ChainNetwork.Ethereum) {
        const rewardPaidEvents = eventsByName<RewardPaidEvent>(receipt, "RewardPaid");
        pickles = rewardPaidEvents[0].args.reward;
      } else {
        const harvestEvents = eventsByName<HarvestEvent>(receipt, "Harvest");
        pickles = harvestEvents[0].args.amount;
      }

      dispatch(
        UserActions.setTokenData({
          account,
          apiKey: asset.details.apiKey,
          data: {
            picklePending: "0",
          },
        }),
      );
    } else {
      // Dill rewards
      const claimedEvents = eventsByName<ClaimedEvent>(receipt, "Claimed");
      pickles = claimedEvents[0].args.amount;

      dispatch(UserActions.setDillData({ account, data: { claimable: "0" } }));
    }

    dispatch(
      UserActions.addHarvestedPickles({ account, chain: network, amount: pickles.toString() }),
    );
  };

  const { sendTransaction, error, isWaiting } = useTransaction(
    transactionFactory(),
    callback,
    send,
    true,
  );

  const openModal = () => {
    send(Actions.RESET);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      {needsNetworkSwitch && showNetworkSwitch ? (
        <ConnectButton size={buttonSize} network={jarNetwork} />
      ) : (
        <Button
          type={buttonType}
          size={buttonSize}
          state={picklePendingAmount > 0 ? "enabled" : "disabled"}
          onClick={openModal}
        >
          {t("v2.farms.harvest")}
        </Button>
      )}
      <Modal isOpen={isModalOpen} closeModal={closeModal} title={t("v2.dashboard.harvestRewards")}>
        {current.matches(States.AWAITING_CONFIRMATION) && (
          <AwaitingConfirmationNoUserInput
            title={
              <p>
                {t("v2.farms.harvesting")}
                <span className="text-primary ml-2">
                  {roundToSignificantDigits(picklePendingAmount, 3)} PICKLE
                </span>
                <MoreInfo>
                  <span className="text-foreground-alt-200 text-sm">
                    {formatDollars(picklePendingAmount * picklePrice, 3)}
                  </span>
                </MoreInfo>
              </p>
            }
            cta={t("v2.actions.harvest")}
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
            retry={() => send(Actions.RESET)}
          />
        )}
      </Modal>
    </>
  );
};

export default HarvestFlow;
