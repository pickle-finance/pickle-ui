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
import { formatDollars, truncateToMaxDecimals } from "v2/utils";
import { eventsByName, getNativeName } from "../utils";
import { isAcceptingDeposits } from "v2/store/core.helpers";
import { useSelector } from "react-redux";
import { TokenSelect } from "../deposit/FormUniV3";
import { neverExpireEpochTime } from "v1/util/constants";
import { Jar__factory } from "v1/containers/Contracts/factories";
import { UserActions } from "v2/store/user";
import { zapInEvent } from "v1/containers/Contracts/PickleZapV1";

interface Props {
  asset: AssetWithData;
  balances: UserTokenData | undefined;
  nativeBalances: ChainNativetoken | undefined;
}

export interface IZapTokens {
  [key: string]: IZaps;
}

export interface IZaps extends BalanceAllowance {
  decimals: number;
  type: "token" | "wrapped" | "native";
  address: string;
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

  const transactionFactory = () => {
    const { token, amount } = current.context;
    if (
      !UniV2Router ||
      !ZapContract ||
      !swapTx ||
      !token ||
      !core ||
      !asset.depositToken.nativePath ||
      !zapTokens
    )
      return;

    const decimals = zapTokens[token.label.toUpperCase()].decimals;
    const depositAmount = ethers.utils.parseUnits(truncateToMaxDecimals(amount), decimals);

    // If native token, use 0x0 address
    const inputTokenAddress =
      token.value === "native"
        ? ethers.constants.AddressZero
        : core.tokens.find((coreToken) => {
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
      if (!token || !zapTokens) return;
      const decimals = zapTokens[token.label.toUpperCase()].decimals;

      const depositAmount = ethers.utils.parseUnits(truncateToMaxDecimals(amount), decimals);

      if (!UniV2Router || !ZapContract || !token || !core || !asset.depositToken.nativePath) return;

      setSwapTx(
        token.value === "native"
          ? await UniV2Router.populateTransaction.swapExactETHForTokens(
              0,
              asset.depositToken.nativePath?.path || [],
              ZapContract.address,
              BigNumber.from(neverExpireEpochTime),
            )
          : await UniV2Router.populateTransaction.swapExactTokensForTokens(
              depositAmount,
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
    setZapTokens(
      getZapTokens(nativeBalances, balances as UserTokenData, asset as AssetWithData, core),
    );
  }, [nativeBalances?.native, nativeBalances?.wrappedBalance, balances?.componentTokenBalances]);

  const callback = (
    receipt: ethers.ContractReceipt,
    dispatch: AppDispatch,
    value?: ethers.BigNumber,
  ) => {
    if (!account || !zapTokens) return;
    const { token } = current.context;

    /**
     * This will generate two events, queried separately:
     * 1) Transfer of zapped tokens from user's wallet
     * 2) Mint of pTokens sent to user's wallet
     */
    const IERC20 = new ethers.utils.Interface(Jar__factory.abi);

    const transferEventsUnfiltered = receipt.events?.map((event) => {
      try {
        const parsedEvent = IERC20.parseLog(event);
        if (parsedEvent.name === "Transfer") return parsedEvent;
      } catch {
        return null;
      }
    });

    const transferEvents:
      | ethers.utils.LogDescription[]
      | undefined = transferEventsUnfiltered?.flatMap((x) => (x ? [x] : []));
    const zapEvent = eventsByName<zapInEvent>(receipt, "zapIn")[0];

    const zapTokenTransferEvent = transferEvents?.find((event) => event.args.from === account);

    const zapTokenBalance = BigNumber.from(zapTokens[token?.label || ""].balance || "0")
      .sub(zapTokenTransferEvent?.args.value || value)
      .toString();

    const pTokenBalanceBN = BigNumber.from((balances as UserTokenData)?.pAssetBalance || "0");
    const pAssetBalance = pTokenBalanceBN.add(zapEvent.args.tokensRec).toString();

    const tokenKey = token?.label.toLowerCase()!;
    dispatch(
      UserActions.setTokenData({
        account,
        apiKey: asset.details.apiKey,
        data: {
          pAssetBalance,
          // Only update token balances if one of the component tokens are used
          ...(token?.value === "token" && {
            componentTokenBalances: {
              ...balances?.componentTokenBalances,
              [tokenKey]: {
                balance: zapTokenBalance,
                allowance: balances?.componentTokenBalances[tokenKey].allowance!,
              },
            },
          }),
        },
      }),
    );
    if (token?.value === "wrapped")
      dispatch(
        UserActions.setNativeData({
          account,
          chain: asset.chain,
          isWrapped: true,
          data: {
            wrappedBalance: zapTokenBalance,
          },
        }),
      );
    if (token?.value === "native")
      dispatch(
        UserActions.setNativeData({
          account,
          chain: asset.chain,
          isWrapped: true,
          data: {
            native: { balance: zapTokenBalance, allowance: ethers.constants.MaxUint256.toString() },
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
    const { token, amount } = current.context;
    const zapTokenPrice = core?.tokens.find((coreToken) => {
      const tokenMatch =
        token?.value === "token"
          ? token?.label.toLowerCase() === coreToken.id
          : getNativeName(jarChain?.gasTokenSymbol!).toLowerCase() === coreToken.id;
      return tokenMatch && coreToken.chain == chainName;
    })?.price;

    if (!zapTokenPrice) return;

    const valueUSD = parseFloat(amount) * zapTokenPrice;

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
            zapTokens={zapTokens!}
            zapAddress={ZapContract?.address}
            balances={balances}
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
        const currToken: PickleModelJson.IExternalToken | undefined = core?.tokens.find(
          (x) => x.chain === asset.chain && x.id === curr.toLowerCase(),
        );

        const currDecimals = currToken?.decimals || 18;

        return {
          ...acc,
          [curr.toUpperCase()]: {
            balance: componentTokens[curr]?.balance,
            allowance: componentTokens[curr]?.allowance, // TODO: this is only the jar allowance (used in univ3 zaps), need to update for specific zap contract/protocol in pf-core. Can potentially use the same property to express allowance for respective protocol's zap contract, since there's no overlap between univ3 jars and zaps currently
            decimals: currDecimals,
            type: "token",
            address: currToken?.contractAddr || ethers.constants.AddressZero,
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
          address: ethers.constants.AddressZero,
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
          address: jarChain?.wrappedNativeAddress,
        },
      }),
  };
};

export default ZapFlow;
