import { FC, useState } from "react";
import { Card, Select, Spacer, Input, Button, Link } from "@geist-ui/react";
import { getTokenLabel } from "./tokens";
import { TokenSymbol, useBalance } from "./useBalance";
import { useDeposit } from "./useDeposit";
import { useDepositEth } from "./useDeposit";

const formatValue = (numStr: string) =>
  parseFloat(numStr).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: parseFloat(numStr) < 1 ? 18 : 4,
  });

export const DepositZap: FC = () => {
  const [inputToken, setInputToken] = useState<TokenSymbol>("ETH");
  const [amount, setAmount] = useState<string>("0");
  const [txState, setTxState] = useState<string | null>(null);

  const { balanceStr, decimals } = useBalance(inputToken);
  const setToMax = (e: any) => {
    e.preventDefault();
    balanceStr !== null && setAmount(balanceStr);
  };

  const { approve, deposit } = useDeposit(inputToken, amount, decimals);
  const { depositEth } = useDepositEth(amount);
  const handleDeposit = async () => {
    if (amount && decimals) {
      if(inputToken == "ETH"){
        try {
          setTxState("Zapping...");
          await depositEth();
          setTxState(null);
        } catch (error) {
          console.error(error);
          alert(error.message);
          setTxState(null);
          return;
        }
      }
      else{
        try {
          setTxState("Approving...");
          await approve();
          setTxState("Zapping...");
          await deposit();
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

  const disableZap = () => {
    if (txState !== null) return true;
    if (amount === "0") return true;
    if (amount === "") return true;
    if (balanceStr && parseFloat(amount) > parseFloat(balanceStr)) return true;
    return false;
  };

  const inputTokens = [
    { symbol: "ETH", label: getTokenLabel("ETH") },
    { symbol: "CRV", label: getTokenLabel("CRV") }
  ];
  return (
    <Card>
      <h2>Zap</h2>
      <p>
        Zap ETH or CRV into Sushi ETH/yveCRV and auto-deposit to Pickle Jar.
      </p>
      <h3>Deposit Token</h3>
      <Select
        size="large"
        width="100%"
        style={{ maxWidth: "100%" }}
        value={inputToken}
        onChange={(e) => setInputToken(e.toString() as TokenSymbol)}
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
          lineHeight: "1.625rem",
        }}
      >
        <div>Balance: {balanceStr !== null ? formatValue(balanceStr) : 0}</div>
        <Link color href="#" onClick={setToMax}>
          Max
        </Link>
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
