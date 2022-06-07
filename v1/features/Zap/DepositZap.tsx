import { FC, useState } from "react";
import { Card, Select, Spacer, Input, Button, Link as DisplayLink } from "@geist-ui/react";
import { getTokenLabel } from "./tokens";
import { TokenSymbol, useBalance } from "./useBalance";
import { useZapIn } from "./useZapper";
import { TokenIcon } from "../../components/TokenIcon";
import { useMigrate } from "../Farms/UseMigrate";
import { Connection } from "v1/containers/Connection";
import { Trans, useTranslation } from "next-i18next";
import { Link } from "v1/components/Link";

import { DEFAULT_SLIPPAGE, YVECRVETH_JAR, CRV_ADDRESS, ETH_ADDRESS } from "./constants";
import { ChainNetwork } from "picklefinance-core";

const formatValue = (numStr: string) =>
  parseFloat(numStr).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: parseFloat(numStr) < 1 ? 6 : 4,
  });

export const DepositZap: FC = () => {
  const [inputToken, setInputToken] = useState<TokenSymbol>("ETH");
  const [sellTokenAddress, setSellTokenAddress] = useState(ETH_ADDRESS);
  const { chainName } = Connection.useContainer();
  const [amount, setAmount] = useState<string>("0");
  const [txState, setTxState] = useState<string | null>(null);
  const { t } = useTranslation("common");

  const { balanceStr, decimals } = useBalance(inputToken);
  const setToMax = (e: any) => {
    e.preventDefault();
    balanceStr !== null && setAmount(balanceStr);
  };

  const { zapIn } = useZapIn({
    poolAddress: YVECRVETH_JAR,
    sellTokenAddress,
    rawAmount: amount,
    slippagePercentage: DEFAULT_SLIPPAGE,
  });

  const { depositYvboost } = useMigrate(null, 0, null, null);

  const handleDeposit = async () => {
    if (amount && decimals) {
      {
        try {
          setTxState(t("zap.zapping"));
          await zapIn();
          setTxState(t("zap.depositing"));
          await depositYvboost();
          setTxState(null);
        } catch (error) {
          console.error(error);
          alert(error.message);
          setTxState(null);
          return;
        }
      }
    }
  };

  const setInput = (inputToken: TokenSymbol) => {
    setInputToken(inputToken);
    if (inputToken === "ETH") {
      setSellTokenAddress(ETH_ADDRESS);
    } else {
      setSellTokenAddress(CRV_ADDRESS);
    }
  };

  const isEth = chainName === ChainNetwork.Ethereum;

  const disableZap = () => {
    if (!isEth) return true;
    if (txState !== null) return true;
    if (amount === "0") return true;
    if (amount === "") return true;
    const parsedAmount = parseFloat(amount);
    if (balanceStr && parsedAmount > parseFloat(balanceStr)) return true;
    if (parsedAmount < 0) return true;
    return false;
  };

  const inputTokens = [
    { symbol: "ETH", label: getTokenLabel("ETH") },
    { symbol: "CRV", label: getTokenLabel("CRV") },
  ];
  return (
    <Card>
      <h2>
        <TokenIcon src="/yvboost.png" />
        {t("zap.zapTo")}
      </h2>
      <p>
        <Trans i18nKey="zap.description">
          Zap ETH or CRV into ETH/yvBOOST SLP and auto-deposit to
          <Link href="/farms">Pickle Farm</Link>.
        </Trans>
      </p>
      <h3>{t("zap.deposit")}</h3>
      <Select
        size="large"
        width="100%"
        style={{ maxWidth: "100%" }}
        value={inputToken}
        onChange={(e) => setInput(e.toString())}
      >
        {inputTokens.map((token) => (
          <Select.Option style={{ fontSize: "1rem" }} value={token.symbol} key={token.symbol}>
            <div style={{ display: `flex`, alignItems: `center` }}>{token.label}</div>
          </Select.Option>
        ))}
      </Select>
      <Spacer />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          lineHeight: "1.25rem",
        }}
      >
        <div>
          {t("balances.balance")}: {balanceStr !== null ? formatValue(balanceStr) : 0}
        </div>
        <DisplayLink color href="#" onClick={setToMax}>
          {t("balances.max")}
        </DisplayLink>
      </div>
      <Input
        placeholder="0"
        onChange={(e) => setAmount(e.target.value)}
        value={amount}
        width="100%"
        type="number"
        size="large"
      />
      <Spacer />
      <Button style={{ width: "100%" }} onClick={handleDeposit} disabled={disableZap()}>
        {txState || !isEth ? t("zap.notAvailable") : t("zap.zap")}
      </Button>
    </Card>
  );
};
