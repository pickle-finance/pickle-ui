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
import { calculateBasisPoint, getAmountWRTDecimal, getAmountWRTUpperDenom } from "./utils";
import { BigNumber } from "bignumber.js";
import { FlipTokens } from "./FlipTokens";
import { DELAY_FOR_BALANCES, DELAY_FOR_QOUTE, GPv2VaultRelayerAddress } from "./constants";
import { OrderKind } from "@cowprotocol/cow-sdk";
import ApprovalFlow from "./flow/ApprovalFlow";
import { Erc20__factory } from "containers/Contracts/factories/Erc20__factory";
import { CurrencyInput } from "./CurrencyInput";
import { SwapInfo } from "./SwapInfo";
import { Container, StyledButton, SwapContainer } from "./style";
import { ConfirmationSwap } from "./ConfirmationSwap";

type LoadingErrorHandler<T> = {
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
  const {
    control,
    watch,
    handleSubmit,
    formState: { isDirty, isValid },
    setValue,
  } = useForm<SwapForm>({
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
  const [swapData, setSwapData] = useState<LoadingErrorHandler<any>>({
    isLoading: false,
    data: {},
    error: "",
  });

  const [swapError, setSwapError] = useState("");

  const [openConfirmationalModel, setOpenConfirmationalModel] = useState(false);

  const { getQoute, sendSwap, error: cowSwapError } = useCowSwap();

  const [slippageTolerance, setSlippageTolerance] = useState(calculateBasisPoint(1000));

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
      let token = token2;
      let rate = costOfOneTokenWRTOtherToken(false, qouteData);
      if (kind === OrderKind.BUY) {
        token = token1;
        rate = costOfOneTokenWRTOtherToken(true, qouteData);
      }
      const res = new BigNumber(rate).times(qouteData?.feeAmount).toString();
      return getAmountWRTUpperDenom(res, token?.value.decimals ?? 18);
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
    if (!!token1Contract) {
      setToken1Balance((await token1Contract.balanceOf(account)).toString());
    }
    if (!!token2Contract) {
      setToken2Balance((await token2Contract.balanceOf(account)).toString());
    }
  }, [token1, token2, token1Contract, token2Contract]);

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

  const finalSubmit = async ({
    token1,
    token2,
  }: {
    token1: SwapSelect | undefined;
    token2: SwapSelect | undefined;
  }) => {
    try {
      if (!account || !chainId) throw new Error("MetaMask is not connected");
      if (!token1 || !token2) throw new Error("Please fill the swap details");
      if (!GPv2VaultRelayerAddress[chainId])
        throw new Error("Chain Id is not supported for the swap");
      setSwapData((state) => ({
        ...state,
        isLoading: true,
        error: "",
      }));
      let adjustedSlippageBuyAmount = confirmationalSwap?.buyAmount;
      let adjustedSlippageSellAmount = confirmationalSwap?.sellAmount;
      if (!adjustedSlippageBuyAmount || !adjustedSlippageSellAmount)
        throw new Error("Buy/Sell amount is zero");

      if (OrderKind.SELL === confirmationalSwap.kind) {
        adjustedSlippageBuyAmount = new BigNumber(slippageTolerance.plus(1))
          .times(adjustedSlippageBuyAmount)
          .toString();
      } else {
        adjustedSlippageSellAmount = new BigNumber(new BigNumber(1).minus(slippageTolerance))
          .times(adjustedSlippageSellAmount)
          .toString();
      }

      const swapId = await sendSwap({
        buyAmount: adjustedSlippageBuyAmount,
        buyToken: token2.value.address,
        feeAmount: confirmationalSwap?.feeAmount,
        sellAmount: adjustedSlippageSellAmount,
        sellToken: token1.value.address,
        kind,
      });

      setSwapData((state) => ({
        ...state,
        isLoading: false,
        data: swapId,
        error: "",
      }));
    } catch (err: any) {
      setSwapData((state) => ({
        ...state,
        isLoading: false,
        data: {},
        error: err?.message ?? "Error Occurred in Swap",
      }));
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
    if (qoute.isLoading || swapData.isLoading) return "Loading ...";
    if (!!qoute.error) return qoute.error;
    if (!!swapData.error) return swapData.error;
    if (!!cowSwapError) return cowSwapError;
    if (!!swapError) return swapError;
  }, [qoute, cowSwapError, swapData, swapError]);

  return (
    <Container>
      {openConfirmationalModel ? (
        <ConfirmationSwap
          token1={token1}
          token2={token2}
          confirmationalSwap={confirmationalSwap}
          setOpenConfirmationalModel={setOpenConfirmationalModel}
          getFee={getFee}
          kind={kind}
          handleOnClick={finalSubmit}
          costOfOneTokenWRTOtherToken={costOfOneTokenWRTOtherToken}
          error={handlerErrorAndLoader}
        />
      ) : (
        <SwapContainer>
          <div>{handlerErrorAndLoader()}</div>
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
            <ApprovalFlow
              visible={visibleApproval && !qoute.error}
              token={token1?.value?.address ?? ""}
              setVisibleApproval={setVisibleApproval}
            />
            {!(visibleApproval && !qoute.error) && <div className="py-6" />}
            <StyledButton
              disabled={isEmpty(qoute.data) || !!qoute.error || visibleApproval}
              type="submit"
            >
              Submit
            </StyledButton>
          </form>
        </SwapContainer>
      )}
    </Container>
  );
};

export default SwapMainCard;
