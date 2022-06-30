import { FC, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { BigNumber, ethers } from "ethers";
import { useMachine } from "@xstate/react";
import { Chains, PickleModelJson } from "picklefinance-core";
import {
  BalanceAllowance,
  ChainNativetoken,
  UserBrineryData,
  UserTokenData,
} from "picklefinance-core/lib/client/UserModel";
import { LightningBoltIcon } from "@heroicons/react/solid";

import { AppDispatch } from "v2/store";
import Button from "v2/components/Button";
import Modal from "v2/components/Modal";
import { AssetWithData, BrineryWithData, CoreSelectors, JarWithData } from "v2/store/core";
import { stateMachine, Actions, States } from "../stateMachineUserInput";
import Form from "./Form";
import { jarDecimals } from "v2/utils/user";
import AwaitingConfirmation from "../deposit/AwaitingConfirmation";
import AwaitingReceipt from "../AwaitingReceipt";
import Success from "../Success";
import Failure from "../Failure";
import { useJarContract, useTransaction } from "../hooks";
import { TransferEvent } from "v1/containers/Contracts/Jar";
import { UserActions } from "v2/store/user";
import { formatDollars, truncateToMaxDecimals } from "v2/utils";
import { eventsByName, getNativeName } from "../utils";
import { isAcceptingDeposits } from "v2/store/core.helpers";
import { useSelector } from "react-redux";
// import { TokenSelect } from "../deposit/FormUniV3";
// import { solidityKeccak256 } from "ethers/lib/utils";

type DepositType = "jar" | "brinery";

interface Props {
  asset: AssetWithData | BrineryWithData;
  balances: UserTokenData | UserBrineryData | undefined;
  nativeBalances: ChainNativetoken | undefined;
  type: DepositType;
}

const getZapTokens = (
  userNativeData: ChainNativetoken | undefined,
  userTokenData: UserTokenData | undefined,
  asset: AssetWithData,
  core: PickleModelJson.PickleModelJson | undefined,
): iZapTokens => {
  const componentTokens = userTokenData?.componentTokenBalances || undefined;

  const jarChain = core?.chains.find((chain) => chain.network === asset.chain);

  const nativeName = jarChain ? getNativeName(jarChain.gasTokenSymbol) : undefined;
  const wrappedName = nativeName && "W" + nativeName;

  const nativeDecimals =
    core?.tokens.find((x) => x.chain === asset.chain && x.id === nativeName)?.decimals || 18;

  return {
    ...(componentTokens &&
      Object.keys(componentTokens).reduce((acc, curr) => {
        const currDecimals =
          core?.tokens.find((x) => x.chain === asset.chain && x.id === curr.toLowerCase())
            ?.decimals || 18;

        return {
          ...acc,
          [curr.toUpperCase()]: {
            balance: componentTokens[curr]?.balance,
            allowance: componentTokens[curr]?.allowance, // TODO: this is only the jar allowance (used in univ3 zaps), need to update for specific zap contract/protocol in pf-core. Can potentially use the same property to express allowance for respective protocol's zap contract, since there's no overlap between univ3 jars and zaps currently
            decimals: currDecimals,
            type: "token",
          },
        };
      }, {})),
    ...(nativeName &&
      wrappedName && {
        [nativeName]: {
          balance: userNativeData?.native.balance,
          allowance: userNativeData?.native.allowance,
          decimals: nativeDecimals,
          type: "native",
        },
        [wrappedName]: {
          balance: userNativeData?.wrappedBalance,
          allowance:
            userNativeData?.wrappedAllowances[
              Object.keys(userNativeData?.wrappedAllowances!).find((x) => x === asset.protocol) ||
                ""
            ],
          decimals: nativeDecimals,
          type: "wrapped",
        },
      }),
  };
};

interface iZapTokens {
  [key: string]: iZaps;
}

interface iZaps extends BalanceAllowance {
  decimals: number;
  type: "token" | "wrapped" | "native";
}

const ZapFlow: FC<Props> = ({ asset, nativeBalances, balances, type }) => {
  const { t } = useTranslation("common");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [current, send] = useMachine(stateMachine);
  const { account } = useWeb3React<Web3Provider>();
  const core = useSelector(CoreSelectors.selectCore);

  const chain = Chains.get(asset.chain);
  const { contract } = asset;
  const JarContract = useJarContract(contract);

  const decimals = jarDecimals(asset);
  const depositTokenBalanceBN = BigNumber.from(balances?.depositTokenBalance || "0");

  const zapTokens = getZapTokens(
    nativeBalances,
    balances as UserTokenData,
    asset as AssetWithData,
    core,
  );

  const debug = true;
  const [printed, setPrinted] = useState(false);
  if (debug) {
    if (!printed) {
      console.log(zapTokens);
      setPrinted(true);
    }
  }
  const transactionFactory = () => {
    if (!JarContract) return;

    const amount = ethers.utils.parseUnits(truncateToMaxDecimals(current.context.amount), decimals);

    return () => JarContract.deposit(amount);
  };

  const callback = (receipt: ethers.ContractReceipt, dispatch: AppDispatch) => {
    if (!account) return;

    /**
     * This will generate two events:
     * 1) Transfer of LP tokens from user's wallet to the jar
     * 2) Mint of pTokens sent to user's wallet
     */
    const transferEvents = eventsByName<TransferEvent>(receipt, "Transfer");
    const depositTokenTransferEvent = transferEvents.find((event) => event.args.from === account)!;
    const pTokenTransferEvent = transferEvents.find((event) => event.args.to === account)!;

    const depositTokenBalance = depositTokenBalanceBN
      .sub(depositTokenTransferEvent.args.value)
      .toString();

    if (type === "brinery") {
      const brineryBalance = (balances as UserBrineryData)?.balance || "0";
      const newBrineryBalance = BigNumber.from(brineryBalance)
        .add(pTokenTransferEvent.args.value)
        .toString();

      dispatch(
        UserActions.setBrineryData({
          account,
          apiKey: asset.details.apiKey,
          data: {
            depositTokenBalance,
            balance: newBrineryBalance,
          },
        }),
      );
    } else {
      const pTokenBalanceBN = BigNumber.from((balances as UserTokenData)?.pAssetBalance || "0");
      const pAssetBalance = pTokenBalanceBN.add(pTokenTransferEvent.args.value).toString();
      dispatch(
        UserActions.setTokenData({
          account,
          apiKey: asset.details.apiKey,
          data: {
            depositTokenBalance,
            pAssetBalance,
          },
        }),
      );
    }
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

  const equivalentValue = () => {
    const depositTokenPrice = asset.depositToken.price;

    if (!depositTokenPrice) return;

    const valueUSD = parseFloat(current.context.amount) * depositTokenPrice;

    return `~ ${formatDollars(valueUSD)}`;
  };

  return (
    <>
      <Button
        type="primary"
        state={isAcceptingDeposits(asset) ? "enabled" : "disabled"}
        onClick={openModal}
      >
        <LightningBoltIcon className="w-3 h-3" />
      </Button>
      <Modal
        isOpen={isModalOpen}
        closeModal={closeModal}
        title={t("v2.farms.zapToToken", { token: asset.depositToken.name })}
      >
        {current.matches(States.FORM) && (
          <Form
            jar={asset as JarWithData}
            nextStep={(amount: string) => send(Actions.SUBMIT_FORM, { amount })}
            zapTokens={zapTokens}
          />
        )}
        {current.matches(States.AWAITING_CONFIRMATION) && (
          <AwaitingConfirmation
            title={t("v2.farms.confirmDeposit")}
            cta={t("v2.actions.deposit")}
            tokenName={asset.depositToken.name}
            amount={current.context.amount}
            equivalentValue={equivalentValue()}
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

export default ZapFlow;
