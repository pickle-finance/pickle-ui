import { ChangeEvent, FC, useCallback, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { BigNumber, ethers } from "ethers";
import { formatEther, formatUnits, parseUnits } from "ethers/lib/utils";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

import Button from "v2/components/Button";
import ErrorMessage from "../Error";
import AmountSteps from "v2/components/AmountSteps";
import { TokenSelect } from "../deposit/FormUniV3";
import TokenOptions from "../deposit/TokenOptions";
import { useAppDispatch, useAppSelector } from "v2/store";
import { CoreSelectors, JarWithData } from "v2/store/core";
import { IZaps, IZapTokens } from "./ZapFlow";
import { useTokenContract, useTransaction } from "../hooks";
import { useMachine } from "@xstate/react";
import { stateMachine } from "../stateMachineNoUserInput";
import { ApprovalEvent } from "v1/containers/Contracts/Erc20";
import { UserActions } from "v2/store/user";
import { UserTokenData } from "picklefinance-core/lib/client/UserModel";
import { classNames } from "v2/utils";
import { ChainNetwork } from "picklefinance-core";
import Spinner from "v2/components/Spinner";
import { getWidoSpender, ZERO_ADDRESS } from "wido";

interface Props {
  jar: JarWithData;
  nextStep: (amount: string, token: TokenSelect) => void;
  zapTokens: IZapTokens;
  balances: UserTokenData | undefined;
}

const Form: FC<Props> = ({ jar, nextStep, zapTokens, balances }) => {
  const { t } = useTranslation("common");
  const { account } = useWeb3React<Web3Provider>();
  const dispatch = useAppDispatch();

  const core = useAppSelector(CoreSelectors.selectCore);
  const jarChain = core?.chains.find((chain) => chain.network === jar.chain);

  const [selectedToken, setSelectedToken] = useState<TokenSelect>({
    label: jarChain?.gasTokenSymbol.toUpperCase() || "",
    value: "native",
  });

  const [zapAddress, setZapAddress] = useState<string | undefined>(undefined);

  const selectedTokenInfo = zapTokens[selectedToken.label];

  const [current, send] = useMachine(stateMachine);
  const [mainnetTokenIn, setMainnetTokenIn] = useState<{
    balance: string;
    allowance: string;
  } | null>(null);

  const selectedTokenContract = useTokenContract(selectedTokenInfo?.address);

  // Fetching balances and allowances on-the-fly on mainnet - 5s interval
  const handleTokenBalances = useCallback(async () => {
    if (!account || jar.chain != ChainNetwork.Ethereum) return;
    if (!!selectedTokenContract && selectedTokenContract.address != ZERO_ADDRESS) {
      const zapAddress = await getWidoSpender({
        chainId: 1,
        fromToken: selectedTokenInfo?.address,
        toToken: jar.contract,
      });
      const balance = (await selectedTokenContract.balanceOf(account)).toString();
      const allowance = (await selectedTokenContract.allowance(account, zapAddress)).toString();
      setZapAddress(zapAddress);
      setMainnetTokenIn({ balance, allowance });
    }
  }, [account, selectedTokenContract]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleTokenBalances();
    }, 5_000);
    return () => clearInterval(interval);
  }, [handleTokenBalances]);

  useEffect(() => {
    setMainnetTokenIn(null);
    setAmount("0");
    handleTokenBalances();
  }, [handleTokenBalances, selectedToken]);

  const selectedTokenObj = zapTokens[selectedToken.label];
  const ZapTokenContract = useTokenContract(selectedTokenObj.address);

  const useMainnetToken = parseFloat(mainnetTokenIn?.balance || "0") > 0;

  const usedBalance = useMainnetToken ? mainnetTokenIn?.balance : selectedTokenObj?.balance;
  const usedDecimals = selectedTokenObj?.decimals;

  const displayBalanceStr = formatUnits(usedBalance!, usedDecimals);
  const [amount, setAmount] = useState<string>(displayBalanceStr);

  const options: Array<TokenSelect> = Object.keys(zapTokens).map((x) => {
    return {
      label: x,
      value: zapTokens[x].type,
    };
  });

  const userHasZapAllowance =
    parseInt(
      (jar.chain === ChainNetwork.Ethereum
        ? mainnetTokenIn?.allowance
        : selectedTokenObj?.allowance) || "0",
    ) > 0 || selectedToken.value === "native";

  const transactionFactory = () => {
    if (!ZapTokenContract || !zapAddress) return;

    return () => ZapTokenContract.approve(zapAddress, ethers.constants.MaxUint256);
  };

  const callback = (receipt: ethers.ContractReceipt) => {
    if (!account) return;

    const approvalEvent = receipt.events?.find(
      ({ event }) => event === "Approval",
    ) as ApprovalEvent;
    const approvedAmount = approvalEvent.args[2];

    const tokenKey = selectedToken.label.toLowerCase();

    if (selectedToken.value === "token")
      dispatch(
        UserActions.setTokenData({
          account,
          apiKey: jar.details.apiKey,
          data: {
            componentTokenBalances: {
              ...balances!.componentTokenBalances,
              [tokenKey]: {
                ...balances!.componentTokenBalances[tokenKey],
                allowance: approvedAmount.toString(),
              },
            },
          },
        }),
      );
    if (selectedToken.value === "wrapped")
      dispatch(
        UserActions.setNativeData({
          account,
          chain: jar.chain,
          isWrapped: true,
          data: {
            wrappedAllowances: { [jar.protocol]: approvedAmount.toString() },
          },
        }),
      );
  };

  const { sendTransaction, error: approveError, isWaiting } = useTransaction(
    transactionFactory(),
    callback,
    send,
    true,
  );

  const invalidAmountError = Error(t("v2.farms.invalidAmount"));
  const [error, setError] = useState<Error | undefined>();

  const validate = (value: string) => {
    if (!value) {
      setError(invalidAmountError);
      return;
    }

    const valueBN = parseUnits(value, usedDecimals);

    const isValid = valueBN.gt(0) && valueBN.lte(BigNumber.from(usedBalance));

    isValid ? setError(undefined) : setError(invalidAmountError);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setAmount(value);
    validate(value);
  };

  const handleFormSubmit = () => {
    if (error) return;

    nextStep(amount, selectedToken);
  };

  return (
    <>
      <h2 className="text-foreground-alt-100 flex font-title text-lg mb-4 ml-4">
        {
          <TokenOptions
            selectedToken={selectedToken}
            setSelectedToken={setSelectedToken}
            options={options}
          />
        }
      </h2>
      <div className="bg-background-lightest rounded-xl px-4 py-2 mb-6">
        <div className="flex justify-between mb-2">
          <p className="font-bold text-foreground-alt-300 text-xs tracking-normal leading-4">
            {t("v2.balances.amount")}
          </p>
          <p className="font-bold text-foreground-alt-300 text-xs tracking-normal leading-4">
            {t("v2.balances.balance")}: {displayBalanceStr}
          </p>
        </div>

        <div className="flex justify-between">
          <input
            type="number"
            className="w-3/5 bg-transparent focus:outline-none flex-shrink-0 font-medium text-primary leading-7"
            value={amount}
            onChange={handleChange}
          />
          <Button
            size="small"
            onClick={() => {
              setAmount(displayBalanceStr);
              validate(displayBalanceStr);
            }}
          >
            {t("v2.balances.max")}
          </Button>
        </div>
      </div>
      <div className="mb-5">
        <AmountSteps
          setTransactionAmount={(amountShare) =>
            setAmount(
              formatUnits(
                BigNumber.from(usedBalance)
                  .mul((amountShare * 100).toString())
                  .div(100)
                  .toString(),
                usedDecimals,
              ),
            )
          }
        />
      </div>
      <ErrorMessage error={error || approveError} />
      {!userHasZapAllowance ? (
        <Button
          onClick={sendTransaction}
          state={isWaiting ? "disabled" : "enabled"}
          className={classNames(isWaiting && "p-3")}
        >
          {isWaiting && (
            <div className="w-5 h-5 mr-3">
              <Spinner />
            </div>
          )}
          {t("v2.farms.approveToken", { token: selectedToken.label })}
        </Button>
      ) : (
        <Button state={error ? "disabled" : "enabled"} onClick={handleFormSubmit}>
          {t("v2.actions.confirmZap")}
        </Button>
      )}
      {jar.chain == ChainNetwork.Ethereum && (
        <p className="pt-3 font-bold text-foreground-alt-300">{t("v2.actions.poweredBy")}</p>
      )}
    </>
  );
};

export default Form;
