import { FC, useCallback, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";
import { useApproveAmount } from "./useApproveCallback";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { useCowSwap } from "./useCowSwap";
import { getListOfTokens } from "./useTokenList";
import { SwapSelector, SwapSelect } from "./SwapSelector";
import { SwapInput } from "./SwapInput";
import { useInterval } from "./hooks";
import isEmpty from "lodash/isEmpty";
import { getAmountWRTDecimal, getAmountWRTUpperDenom } from "./utils";
import { BigNumber } from "bignumber.js";
import { FlipTokens } from "./FlipTokens";
import { DELAY_FOR_BALANCES, DELAY_FOR_QOUTE, GPv2VaultRelayerAddress } from "./constants";
import { OrderKind } from "@gnosis.pm/gp-v2-contracts";
import ApprovalFlow from "./flow/ApprovalFlow";
import { Erc20__factory } from "containers/Contracts/factories/Erc20__factory";
import { Link } from "@material-ui/core";

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
  const [swapData, setSwapData] = useState<LoadingErrorHandler<any>>({
    isLoading: false,
    data: {},
    error: "",
  });

  const { getQoute, sendSwap, error: cowSwap } = useCowSwap();

  const isEligibleQoute = !!token1?.value?.address && !!token2?.value?.address && !!amount1;

  useEffect(() => {
    if (!isEligibleQoute) return;
    handleQoute();
    handleTokenBalances();
  }, [token1, token2, amount1, account]);

  const handleQoute = async () => {
    try {
      setQoute((state) => ({
        ...state,
        isLoading: true,
        error: "",
      }));
      const qoute = await getQoute({
        sellToken: token1?.value?.address ?? "",
        buyToken: token2?.value?.address ?? "",
        amount: getAmountWRTDecimal(amount1, token1?.value.decimals ?? 18),
        kind,
      });
      setQoute((state) => ({
        ...state,
        isLoading: false,
        data: qoute,
        error: "",
      }));
      setValue("amount2", getAmountWRTUpperDenom(qoute.buyAmount, token2?.value?.decimals ?? 18));
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
      setToken1Balance(
        getAmountWRTUpperDenom(
          (await token1Contract.balanceOf(account)).toString(),
          token1?.value.decimals ?? 18,
        ),
      );
    }
    if (!!token2Contract) {
      setToken2Balance(
        getAmountWRTUpperDenom(
          (await token2Contract.balanceOf(account)).toString(),
          token2?.value.decimals ?? 18,
        ),
      );
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
    setKind((state) => (state === OrderKind.SELL ? OrderKind.BUY : OrderKind.SELL));
    setValue("token2", token1);
    setValue("token1", token2Cpy);
  };

  const submit = async ({
    token1,
    token2,
    amount1,
    amount2,
  }: {
    token1: SwapSelect | undefined;
    amount1: string;
    token2: SwapSelect | undefined;
    amount2: string;
  }) => {
    try {
      if (!account || !chainId) throw new Error("MetaMask is not connected");
      if (!token1 || !token2) throw new Error("Please fill the swap details");
      if (!GPv2VaultRelayerAddress[chainId])
        throw new Error("Chain Id is not supported for the swap");
      const approvedAmount = await checkTokenApproval({
        owner: account,
        spender: GPv2VaultRelayerAddress[chainId].address,
      });
      setSwapData((state) => ({
        ...state,
        isLoading: true,
        error: "",
      }));
      const data = await handleQoute();
      console.log(approvedAmount?.toString(), data?.sellAmount);
      console.log(approvedAmount?.lt(data?.sellAmount));
      setVisibleApproval(!!approvedAmount?.lt(data?.sellAmount));
      const swapId = await sendSwap({
        buyAmount: data?.buyAmount,
        buyToken: data?.buyToken,
        feeAmount: data?.feeAmount,
        sellAmount: data?.sellAmount,
        sellToken: data?.sellToken,
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
    (flip = false) => {
      const ratio = (q1: string, q2: string) =>
        new BigNumber(q2).div(q1).decimalPlaces(6).toString();
      if (isEmpty(qoute?.data)) return "0";
      if (flip) {
        return ratio(qoute.data.buyAmount, qoute.data.sellAmount);
      }
      return ratio(qoute.data.sellAmount, qoute.data.buyAmount);
    },
    [qoute],
  );

  const handlerErrorAndLoader = useCallback(() => {
    if (qoute.isLoading || swapData.isLoading) return "Loading ...";
    if (!!qoute.error) return qoute.error;
    if (!!swapData.error) return swapData.error;
    if (!!cowSwap) return cowSwap;
  }, [qoute, cowSwap, swapData]);

  return (
    <div>
      <div>{handlerErrorAndLoader()}</div>
      <ApprovalFlow visible={visibleApproval} token={token1?.value?.address ?? ""} />
      <form onSubmit={handleSubmit((form: SwapForm) => submit(form))}>
        <div>
          <SwapSelector
            control={control}
            list={LIST_WITH_CHAINID}
            name={"token1"}
            selected={token2}
            key={"1"}
          />
        </div>
        <div>
          <SwapInput token={token1?.value} name="amount1" control={control} />
        </div>
        <div>
          <span>
            {!!token1Balance && <Link onClick={() => setValue("amount1", token1Balance)}>Max</Link>}
          </span>{" "}
          <span>{!!token1Balance && `Balance: ${token1Balance}`}</span>
        </div>
        <FlipTokens onClick={flip} />
        <div>
          <SwapSelector
            control={control}
            list={LIST_WITH_CHAINID}
            name={"token2"}
            selected={token1}
            key={"2"}
          />
        </div>
        <div>
          <SwapInput token={token2?.value} name="amount2" control={control} />
        </div>
        <div>
          <span>
            {!!token2Balance && <Link onClick={() => setValue("amount2", token2Balance)}>Max</Link>}
          </span>{" "}
          <span>{!!token2Balance && `Balance: ${token2Balance}`}</span>
        </div>
        <div>
          {isEligibleQoute &&
            `1 ${token1.value.symbol} = ${costOfOneTokenWRTOtherToken()} ${token2.value.symbol}`}
        </div>
        Fee:{" "}
        {!isEmpty(qoute?.data) &&
          getAmountWRTUpperDenom(
            qoute?.data?.feeAmount,
            (kind === OrderKind.SELL ? token2?.value.decimals : token1?.value.decimals) ?? 18,
          )}
        <div className="relative px-6 py-4 sm:px-8 sm:py-6">
          <button disabled={qoute.isLoading || !!qoute.error} type="submit" className="p-4">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default SwapMainCard;
