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
  UserTokenData,
} from "picklefinance-core/lib/client/UserModel";
import { LightningBoltIcon } from "@heroicons/react/solid";

import { AppDispatch } from "v2/store";
import Button from "v2/components/Button";
import Modal from "v2/components/Modal";
import { AssetWithData, CoreSelectors, JarWithData } from "v2/store/core";
import { stateMachine, Actions, States } from "../stateMachineUserInput";
import Form from "./Form";
import { jarDecimals } from "v2/utils/user";
import AwaitingConfirmation from "../deposit/AwaitingConfirmation";
import AwaitingReceipt from "../AwaitingReceipt";
import Success from "../Success";
import Failure from "../Failure";
import { useTransaction, useZapContracts } from "../hooks";
import { TransferEvent } from "v1/containers/Contracts/Jar";
import { UserActions } from "v2/store/user";
import { formatDollars, truncateToMaxDecimals } from "v2/utils";
import { eventsByName, getNativeName } from "../utils";
import { isAcceptingDeposits } from "v2/store/core.helpers";
import { useSelector } from "react-redux";
import { TokenSelect } from "../deposit/FormUniV3";
import { neverExpireEpochTime } from "v1/util/constants";

interface Props {
  asset: AssetWithData;
  balances: UserTokenData | undefined;
  nativeBalances: ChainNativetoken | undefined;
}

interface IZapTokens {
  [key: string]: IZaps;
}

interface IZaps extends BalanceAllowance {
  decimals: number;
  type: "token" | "wrapped" | "native";
}

const ZapFlow: FC<Props> = ({ asset, nativeBalances, balances }) => {
  const { t } = useTranslation("common");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [current, send] = useMachine(stateMachine);
  const [swapTx, setSwapTx] = useState<ethers.PopulatedTransaction | undefined>(undefined);
  const [zapTokens, setZapTokens] = useState<IZapTokens | undefined>(undefined);
  const { account } = useWeb3React<Web3Provider>();
  const core = useSelector(CoreSelectors.selectCore);

  const chain = Chains.get(asset.chain);
  const jarChain = core?.chains.find((chain) => chain.network === asset.chain);

  const { chain: chainName, protocol } = asset;
  const { UniV2Router, ZapContract } = useZapContracts(chainName, protocol);

  const decimals = jarDecimals(asset);
  const depositTokenBalanceBN = BigNumber.from(balances?.depositTokenBalance || "0");

  const transactionFactory = () => {
    const { token, amount } = current.context;
    if (
      !UniV2Router ||
      !ZapContract ||
      !swapTx ||
      !token ||
      !core ||
      !asset.depositToken.nativePath
    )
      return;

    const depositAmount = ethers.utils.parseUnits(truncateToMaxDecimals(amount), decimals);

    // If native token, use 0x0 address
    const inputTokenAddress =
      token.value === "native"
        ? ethers.constants.AddressZero
        : core.tokens.find((coreToken) => {
            console.log(
              coreToken.id,
              token.label.toLowerCase(),
              getNativeName(jarChain?.gasTokenSymbol!),
            );
            return (
              (token.label.toLowerCase() === coreToken.id ||
                getNativeName(jarChain?.gasTokenSymbol!).toLowerCase() === coreToken.id) &&
              coreToken.chain == chainName
            );
          })?.contractAddr || ethers.constants.AddressZero;

    return () =>
      ZapContract.ZapIn(
        inputTokenAddress,
        depositAmount,
        asset.depositToken.addr,
        asset.contract,
        0,
        asset.depositToken.nativePath!.target,
        swapTx.data || ethers.constants.AddressZero,
        true,
        UniV2Router.address,
        false,
        {
          value: token.value === "native" ? depositAmount : BigNumber.from(0),
        },
      );
  };

  // Uniswap swapTx calldata from to be rebuilt
  useEffect(() => {
    const buildAndSetSwapTx = async () => {
      const { token, amount } = current.context;
      const depositAmount = ethers.utils.parseUnits(truncateToMaxDecimals(amount), decimals);

      if (!UniV2Router || !ZapContract || !token || !core || !asset.depositToken.nativePath) return;

      setSwapTx(
        token.value === "wrapped"
          ? await UniV2Router.populateTransaction.swapExactTokensForTokens(
              depositAmount,
              0,
              asset.depositToken.nativePath?.path || [],
              ZapContract.address,
              BigNumber.from(neverExpireEpochTime),
            )
          : await UniV2Router.populateTransaction.swapExactETHForTokens(
              0,
              asset.depositToken.nativePath?.path || [],
              ZapContract.address,
              BigNumber.from(neverExpireEpochTime),
            ),
      );
    };

    buildAndSetSwapTx();
  }, [current.context.amount]);

  // Update user's zap token balances
  useEffect(() => {
    console.log("should not be here often");
    setZapTokens(
      getZapTokens(nativeBalances, balances as UserTokenData, asset as AssetWithData, core),
    );
  }, [nativeBalances?.native, nativeBalances?.wrappedBalance, balances?.componentTokenBalances]);

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
            nextStep={(amount: string, token: TokenSelect) =>
              send(Actions.SUBMIT_FORM, { amount, token })
            }
            zapTokens={zapTokens}
          />
        )}
        {current.matches(States.AWAITING_CONFIRMATION) && (
          <AwaitingConfirmation
            title={t("v2.farms.confirmDeposit")}
            cta={t("v2.actions.deposit")}
            tokenName={current.context.token?.label}
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
const getZapTokens = (
  userNativeData: ChainNativetoken | undefined,
  userTokenData: UserTokenData | undefined,
  asset: AssetWithData,
  core: PickleModelJson.PickleModelJson | undefined,
): IZapTokens => {
  const componentTokens = userTokenData?.componentTokenBalances || undefined;

  const jarChain = core?.chains.find((chain) => chain.network === asset.chain);

  const nativeName = jarChain ? getNativeName(jarChain.gasTokenSymbol) : undefined;
  const wrappedName = nativeName && "W" + nativeName;

  const nativeDecimals =
    core?.tokens.find((x) => x.chain === asset.chain && x.id === nativeName)?.decimals || 18;

  return {
    ...(componentTokens &&
      Object.keys(componentTokens).reduce((acc, curr) => {
        const currDecimals: number =
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

export default ZapFlow;
