import { FC, useState } from "react";
import { Card, Select, Spacer, Input, Button, Link as DisplayLink } from "@geist-ui/react";
import Link from "next/link";
import { getTokenLabel } from "./tokens";
import { TokenSymbol, useBalance } from "./useBalance";
import { useZapIn } from "./useZapper";
import { TokenIcon } from "../../components/TokenIcon";
import { useMigrate } from "../../features/Farms/UseMigrate";

import {
  DEFAULT_SLIPPAGE,
  YVECRVETH_JAR,
  CRV_ADDRESS,
  ETH_ADDRESS,
} from "./constants";

const formatValue = (numStr: string) =>
  parseFloat(numStr).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: parseFloat(numStr) < 1 ? 6 : 4,
  });

export const DepositZap: FC = () => {
  const [inputToken, setInputToken] = useState<TokenSymbol>("ETH");
  const [sellTokenAddress, setSellTokenAddress] = useState(ETH_ADDRESS);
  const [amount, setAmount] = useState<string>("0");
  const [txState, setTxState] = useState<string | null>(null);

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

  const {
    depositYvboost,
  } = useMigrate(null, 0, null, null);

  const handleDeposit = async () => {
    if (amount && decimals) {
      {
        try {
          setTxState("Zapping...");
          await zapIn();
          setTxState("Depositing in Farm...");
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

  const disableZap = () => {
    if (txState !== null) return true;
    if (amount === "0") return true;
    if (amount === "") return true;
    if (balanceStr && parseFloat(amount) > parseFloat(balanceStr)) return true;
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
        Zap to yvBOOST
      </h2>
      <p>
        Zap ETH or CRV into ETH/yvBOOST SLP and auto-deposit to{" "}
        <Link href="/farms" passHref>Pickle Farm</Link>.
      </p>
      <h3>Deposit Token</h3>
      <Select
        size="large"
        width="100%"
        style={{ maxWidth: "100%" }}
        value={inputToken}
        onChange={(e) => setInput(e.toString())}
      >
        {inputTokens.map((token) => (
          <Select.Option
            style={{ fontSize: "1rem" }}
            value={token.symbol}
            key={token.symbol}
          >
            <div style={{ display: `flex`, alignItems: `center` }}>
              {token.label}
            </div>
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
        <div>Balance: {balanceStr !== null ? formatValue(balanceStr) : 0}</div>
        <DisplayLink color href="#" onClick={setToMax}>
          Max
        </DisplayLink>
      </div>
      <Input
        onChange={(e) => setAmount(e.target.value)}
        value={amount}
        width="100%"
        type="number"
        size="large"
      />
      <Spacer />
      <Button
        style={{ width: "100%" }}
        onClick={handleDeposit}
        disabled={disableZap()}
      >
        {txState || "Zap"}
      </Button>
    </Card>
  );
};