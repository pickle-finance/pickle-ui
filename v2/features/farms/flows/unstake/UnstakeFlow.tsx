import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { BigNumber, ethers } from "ethers";
import { useMachine } from "@xstate/react";
import { useSelector } from "react-redux";
import { UserTokenData } from "picklefinance-core/lib/client/UserModel";
import { ChainNetwork } from "picklefinance-core";

import Button from "v2/components/Button";
import Modal from "v2/components/Modal";
import { AssetWithData, CoreSelectors } from "v2/store/core";
import { stateMachine, Actions, States } from "../stateMachineUserInput";
import Form from "../deposit/Form";
import { jarDecimals } from "v2/utils/user";
import AwaitingConfirmation from "../deposit/AwaitingConfirmation";
import AwaitingReceipt from "../AwaitingReceipt";
import Success from "../Success";
import Failure from "../Failure";
import { useFarmContract, useTransaction } from "../hooks";
import { UserActions } from "v2/store/user";
import { truncateToMaxDecimals } from "v2/utils";
import { Gauge, RewardPaidEvent, WithdrawnEvent } from "v1/containers/Contracts/Gauge";
import { Minichef, HarvestEvent, WithdrawEvent } from "v1/containers/Contracts/Minichef";
import { AppDispatch } from "v2/store";
import { eventsByName } from "../utils";
import { jarSupportsStaking } from "v2/store/core.helpers";

interface Props {
  asset: AssetWithData;
  balances: UserTokenData | undefined;
}

const UnstakeFlow: FC<Props> = ({ asset, balances }) => {
  if (!jarSupportsStaking(asset)) return null;

  const { t } = useTranslation("common");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const core = useSelector(CoreSelectors.selectCore);
  const [current, send] = useMachine(stateMachine);
  const { account } = useWeb3React<Web3Provider>();

  const chain = core?.chains.find((chain) => chain.network === asset.chain);
  const FarmContract = useFarmContract(asset.farm?.farmAddress, chain);

  const decimals = jarDecimals(asset);
  const pTokenBalanceBN = BigNumber.from(balances?.pAssetBalance || "0");
  const pStakedBalanceBN = BigNumber.from(balances?.pStakedBalance || "0");
  const picklePendingBN = BigNumber.from(balances?.picklePending || "0");

  const isExiting = ethers.utils.formatUnits(pStakedBalanceBN, decimals) === current.context.amount;

  /**
   * A user can either withdraw a partial amount or a full staked amount
   * in which case we also harvest all rewards.
   */
  const transactionFactory = () => {
    if (!FarmContract || !account) return;

    const { chain } = asset;
    const amount = ethers.utils.parseUnits(truncateToMaxDecimals(current.context.amount), decimals);

    if (chain === ChainNetwork.Ethereum) {
      if (isExiting) return () => (FarmContract as Gauge).exit();

      return () => (FarmContract as Gauge).withdraw(amount);
    }

    const poolId = asset.farm?.details?.poolId;
    if (poolId === undefined) return;

    if (isExiting)
      return () => (FarmContract as Minichef).withdrawAndHarvest(poolId, amount, account);

    return () => (FarmContract as Minichef).withdraw(poolId, amount, account);
  };

  const callback = (receipt: ethers.ContractReceipt, dispatch: AppDispatch) => {
    if (!account) return;

    const { chain } = asset;
    let amount: BigNumber;
    let pickles: BigNumber = BigNumber.from(0);

    /**
     * This will generate different events on mainnet and on sidechains.
     * Read amounts withdrawn and harvested.
     */
    if (chain === ChainNetwork.Ethereum) {
      const withdrawnEvents = eventsByName<WithdrawnEvent>(receipt, "Withdrawn");
      amount = withdrawnEvents[0].args.amount;

      if (isExiting) {
        const rewardPaidEvents = eventsByName<RewardPaidEvent>(receipt, "RewardPaid");
        pickles = rewardPaidEvents[0].args.reward;
      }
    } else {
      const withdrawEvents = eventsByName<WithdrawEvent>(receipt, "Withdraw");
      amount = withdrawEvents[0].args.amount;

      if (isExiting) {
        const harvestEvents = eventsByName<HarvestEvent>(receipt, "Harvest");
        pickles = harvestEvents[0].args.amount;
      }
    }

    const pAssetBalance = pTokenBalanceBN.add(amount).toString();
    const pStakedBalance = pStakedBalanceBN.sub(amount).toString();
    const picklePending = picklePendingBN.sub(pickles).toString();

    dispatch(
      UserActions.setTokenData({
        account,
        apiKey: asset.details.apiKey,
        data: {
          pAssetBalance,
          pStakedBalance,
          picklePending,
        },
      }),
    );

    dispatch(UserActions.addHarvestedPickles({ account, chain, amount: pickles.toString() }));
  };

  const { sendTransaction, error, setError, isWaiting } = useTransaction(
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
      <Button
        type="secondary"
        state={pStakedBalanceBN.gt(0) ? "enabled" : "disabled"}
        onClick={openModal}
        className="w-11"
      >
        -
      </Button>
      <Modal
        isOpen={isModalOpen}
        closeModal={closeModal}
        title={t("v2.farms.unstakeToken", { token: asset.farm?.farmDepositTokenName })}
      >
        {current.matches(States.FORM) && (
          <Form
            balance={balances?.pStakedBalance || "0"}
            decimals={decimals}
            nextStep={(amount: string) => send(Actions.SUBMIT_FORM, { amount })}
          />
        )}
        {current.matches(States.AWAITING_CONFIRMATION) && (
          <AwaitingConfirmation
            title={t("v2.farms.confirmUnstake")}
            cta={isExiting ? t("v2.actions.harvestAndExit") : t("v2.actions.unstake")}
            tokenName={asset.farm?.farmDepositTokenName}
            amount={current.context.amount}
            error={error}
            sendTransaction={sendTransaction}
            isWaiting={isWaiting}
            previousStep={() => {
              setError(undefined);
              send(Actions.EDIT);
            }}
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

export default UnstakeFlow;
