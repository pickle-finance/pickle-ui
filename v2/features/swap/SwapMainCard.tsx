import { FC, useCallback, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";
import { useApproveAmount } from "./useApproveCallback";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { useCowSwap } from "./useCowSwap";
import { getListOfTokens } from "./useTokenList";
import { SwapSelect } from "./SwapSelector";
import { useInterval } from "./hooks";
import isEmpty from "lodash/isEmpty";
import { getAmountWRTDecimal, getAmountWRTUpperDenom } from "./utils";
import { BigNumber } from "bignumber.js";
import { FlipTokens } from "./FlipTokens";
import { Erc20__factory } from "v1/containers/Contracts/factories";
import {
  DEFAULT_DEADLINE_IN_MIN,
  DEFAULT_SLIPPAGE_TOLERANCE,
  DELAY_FOR_BALANCES,
  DELAY_FOR_QOUTE,
  GPv2VaultRelayerAddress,
} from "./constants";
import { OrderKind } from "@cowprotocol/cow-sdk";
import ApprovalFlow from "./flow/ApprovalFlow";
import { CurrencyInput } from "./CurrencyInput";
import { SwapInfo } from "./SwapInfo";
import { ConfirmationSwap } from "./ConfirmationSwap";
import { SettingsTab } from "./SettingsTab";
import { ErrorMessage } from "./ErrorMessage";
import { SwapButtons } from "./SwapButtons";

export type LoadingErrorHandler<T> = {
  isLoading: boolean;
  data: T;
  error: string;
};
interface SwapForm {
  token1: SwapSelect | undefined;
  token2: SwapSelect | undefined;
  amount1: string;
  amount2: string;
}

const SwapMainCard: FC = () => {
  const { t } = useTranslation("common");
  const { chainId } = useWeb3React<Web3Provider>();
  const LIST_WITH_CHAINID = getListOfTokens()[chainId ?? 1];
  const [visibleApproval, setVisibleApproval] = useState(false);
  const [token1Balance, setToken1Balance] = useState<string>("");
  const [token2Balance, setToken2Balance] = useState<string>("");
  const { control, watch, handleSubmit, setValue } = useForm<SwapForm>({
    defaultValues: {
      amount1: "",
      amount2: "",
    },
  });
  const { token1, token2, amount1, amount2 } = watch();
  const { account, library } = useWeb3React();
  const [kind, setKind] = useState<OrderKind>(OrderKind.SELL);
  const { checkTokenApproval } = useApproveAmount(token1?.value?.address ?? "");
  const [qoute, setQoute] = useState<LoadingErrorHandler<any>>({
    isLoading: false,
    data: {},
    error: "",
  });
  const [confirmationalSwap, setConfirmationalSwap] = useState<any>();

  const [swapError, setSwapError] = useState("");

  const [openConfirmationalModel, setOpenConfirmationalModel] = useState(false);

  const { getQoute, error: cowSwapError } = useCowSwap();

  const [slippageTolerance, setSlippageTolerance] = useState(DEFAULT_SLIPPAGE_TOLERANCE);

  const [deadLine, setDeadLine] = useState(DEFAULT_DEADLINE_IN_MIN);

  const isEligibleQoute =
    !!token1?.value?.address && !!token2?.value?.address && (!!amount1 || !!amount2);

  useEffect(() => {
    if (!isEligibleQoute) return;
    handleQoute();
    handleTokenBalances();
    handleApprove();
  }, [token1, token2, amount1, account, amount2]);

  const handleApprove = useCallback(async () => {
    try {
      if (!account || !chainId) throw new Error("MetaMask is not connected");
      if (!GPv2VaultRelayerAddress[chainId])
        throw new Error("Chain is not compatible with CowSwap");
      const approvedAmount = await checkTokenApproval({
        owner: account,
        spender: GPv2VaultRelayerAddress[chainId].address,
      });
      setVisibleApproval(!!approvedAmount?.lt(qoute.data?.sellAmount));
      setSwapError("");
    } catch (err: any) {
      setSwapError(err?.message);
    }
  }, [token1, account, chainId, qoute]);

  const getFee = useCallback(
    (qouteVal?: any): string => {
      const qouteData = qouteVal ?? qoute.data;
      if (kind === OrderKind.BUY) {
        return getAmountWRTUpperDenom(qouteData?.feeAmount, token1?.value.decimals ?? 18);
      }
      const res = new BigNumber(costOfOneTokenWRTOtherToken(false, qouteData))
        .times(qouteData?.feeAmount)
        .toString();
      return getAmountWRTUpperDenom(res, token2?.value.decimals ?? 18);
    },
    [token1, token2, qoute],
  );

  const handleQoute = async () => {
    try {
      setQoute((state) => ({
        ...state,
        isLoading: true,
        error: "",
      }));
      let amount;
      if (OrderKind.SELL == kind) {
        amount = getAmountWRTDecimal(amount1, token1?.value.decimals ?? 18);
      } else {
        amount = getAmountWRTDecimal(amount2, token2?.value.decimals ?? 18);
      }
      const qoute = await getQoute({
        sellToken: token1?.value?.address ?? "",
        buyToken: token2?.value?.address ?? "",
        amount,
        kind,
        deadLine,
      });
      setQoute((state) => ({
        ...state,
        isLoading: false,
        data: qoute,
        error: "",
      }));
      const updatedVal = new BigNumber(getFee(qoute));
      if (kind === OrderKind.SELL) {
        setValue(
          "amount2",
          updatedVal
            .plus(getAmountWRTUpperDenom(qoute.buyAmount, token2?.value?.decimals ?? 18))
            .toString(),
        );
      } else {
        console.log(updatedVal.toString(), qoute);
        setValue(
          "amount1",
          updatedVal
            .plus(getAmountWRTUpperDenom(qoute.sellAmount, token1?.value?.decimals ?? 18))
            .toString(),
        );
      }
      return qoute;
    } catch (err: any) {
      setQoute((state) => ({
        ...state,
        isLoading: false,
        data: {},
        error: err?.message ?? "Error occurred in get qoute",
      }));
    }
  };

  const getERC20 = useCallback(
    (address: string | undefined) => {
      if (!library || !address) return;
      return Erc20__factory.connect(address, library.getSigner());
    },
    [library],
  );

  const token1Contract = getERC20(token1?.value?.address);
  const token2Contract = getERC20(token2?.value?.address);

  const handleTokenBalances = useCallback(async () => {
    if (!account) return;
    if (isEmpty(qoute.data)) return;
    if (!!token1Contract) {
      setToken1Balance((await token1Contract.balanceOf(account)).toString());
    }
    if (!!token2Contract) {
      setToken2Balance((await token2Contract.balanceOf(account)).toString());
    }
  }, [token1, token2, token1Contract, token2Contract, qoute]);

  useInterval(handleQoute, isEligibleQoute && !isEmpty(qoute.data) ? DELAY_FOR_QOUTE * 1000 : null);
  useInterval(
    handleTokenBalances,
    !!token1Contract || !!token2Contract ? DELAY_FOR_BALANCES * 1000 : null,
  );

  const flip = () => {
    if (!token1 || !token2) return;
    const token2Cpy = token2;
    setValue("token2", token1);
    setValue("token1", token2Cpy);
  };

  const openConfirmational = ({
    token1,
    token2,
    amount1,
    amount2,
  }: {
    token1: SwapSelect | undefined;
    token2: SwapSelect | undefined;
    amount1: string;
    amount2: string;
  }) => {
    try {
      if (isEmpty(token1) || isEmpty(token2) || !amount1 || !amount2)
        throw new Error("Form is not filled");
      setSwapError("");
      if (new BigNumber(token1Balance).lt(qoute.data.sellAmount))
        throw new Error("Sell Token does not have enough balance");
      setConfirmationalSwap({ ...qoute.data, amount1, amount2 });
      setOpenConfirmationalModel(true);
    } catch (err: any) {
      setSwapError(err?.message);
    }
  };

  const costOfOneTokenWRTOtherToken = useCallback(
    (flip = false, qouteVal?: any): string => {
      let qouteData = qouteVal ?? qoute.data;
      const ratio = (q1: string, q2: string) =>
        new BigNumber(q1).div(q2).decimalPlaces(6).toString();
      if (isEmpty(qouteData)) return "0";
      if (flip) {
        return ratio(qouteData.sellAmount, qouteData.buyAmount);
      }
      return ratio(qouteData.buyAmount, qouteData.sellAmount);
    },
    [qoute],
  );

  const handlerErrorAndLoader = useCallback(() => {
    if (!!qoute.error) return qoute.error;
    if (!!cowSwapError) return cowSwapError;
    if (!!swapError) return swapError;
  }, [qoute, cowSwapError, swapError]);

  const errorMessage = handlerErrorAndLoader();

  return (
    <div className="flex justify-center items-center">
      <div className="h-4/5	w-2/5 p-4 border-solid border-2 rounded-2xl bg-green-600">
        {openConfirmationalModel ? (
          <ConfirmationSwap
            token1={token1}
            token2={token2}
            confirmationalSwap={confirmationalSwap}
            setOpenConfirmationalModel={setOpenConfirmationalModel}
            getFee={getFee}
            kind={kind}
            costOfOneTokenWRTOtherToken={costOfOneTokenWRTOtherToken}
            slippageTolerance={slippageTolerance}
          />
        ) : (
          <div>
            <SettingsTab
              deadline={deadLine}
              setDeadline={setDeadLine}
              setSlippageTolerance={setSlippageTolerance}
              slippageTolerance={slippageTolerance}
            />
            <form onSubmit={handleSubmit((form: SwapForm) => openConfirmational(form))}>
              <CurrencyInput
                control={control}
                inputName="amount1"
                selectorName="token1"
                list={LIST_WITH_CHAINID}
                tokenA={token1}
                tokenB={token2}
                tokenBalance={token1Balance}
                setValue={setValue}
                setKind={setKind}
                kind={OrderKind.SELL}
              />
              <div className="text-center mb-4">
                <FlipTokens onClick={flip} />
              </div>
              <CurrencyInput
                control={control}
                inputName="amount2"
                selectorName="token2"
                list={LIST_WITH_CHAINID}
                tokenA={token2}
                tokenB={token1}
                tokenBalance={token2Balance}
                setValue={setValue}
                setKind={setKind}
                kind={OrderKind.BUY}
              />
              <SwapInfo
                isEligibleQoute={isEligibleQoute}
                qoute={qoute}
                costOfOneTokenWRTOtherToken={costOfOneTokenWRTOtherToken}
                token1={token1}
                token2={token2}
                getFee={getFee}
                kind={kind}
              />
              <ErrorMessage error={errorMessage ?? ""} />
              <div className={!errorMessage ? "py-3" : ""}>
                <div className={!visibleApproval ? "pb-3" : "mb-2"}>
                  <ApprovalFlow
                    visible={visibleApproval && !qoute.error}
                    token={token1?.value?.address ?? ""}
                    setVisibleApproval={setVisibleApproval}
                  />
                </div>
                <SwapButtons
                  disabled={isEmpty(qoute.data) || !!qoute.error || visibleApproval}
                  type="submit"
                >
                  {t("v2.swap.swapSubmitButton")}
                </SwapButtons>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwapMainCard;
