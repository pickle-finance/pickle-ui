import { FC, ReactNode, useEffect, useState } from "react";
import { Select, Spacer, Link, Input, Button } from "@geist-ui/react";
import { getLPLabel, getTokenLabel } from "./tokens";
import { useExitToToken } from "./useExitToToken";
import { Jar, Token } from "./useExitToToken";

const formatValue = (numStr: string) =>
  parseFloat(numStr).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: parseFloat(numStr) < 1 ? 18 : 4,
  });

export const ExitToToken: FC = () => {
  const [jar, setJar] = useState<Jar>(Jar.prenBTCCRV);
  const [token, setToken] = useState<Token>(Token.renBTC);
  const [amount, setAmount] = useState<string>("");
  const [txState, setTxState] = useState<string | null>(null);

  const { balance, approve, exit } = useExitToToken(jar, token);
  const setToMax = (e: any) => {
    e.preventDefault();
    balance !== null && setAmount(balance.toString());
  };

  const handleExit = async () => {
    try {
      setTxState("Approving...");
      await approve(amount);
      setTxState("Exiting...");
      await exit(amount);
      setTxState(null);
    } catch (error) {
      console.error(error);
      alert(error.message);
      setTxState(null);
      return;
    }
  };

  const isDisabled = () => {
    if (txState !== null) return true;
    if (amount === "0") return true;
    if (amount === "") return true;
    if (balance && parseFloat(amount) > parseFloat(balance)) return true;
    return false;
  };

  const jars: { symbol: Jar; label: ReactNode }[] = [
    { symbol: Jar.prenBTCCRV, label: getLPLabel("renBTCCRV") },
    { symbol: Jar.p3poolCRV, label: getLPLabel("3poolCRV") },
    { symbol: Jar.pDAI, label: getLPLabel("pDAI") },
  ];

  // show different token list depending on selected jar
  type TokenSelect = { symbol: Token; label: ReactNode };
  let tokens: TokenSelect[] = [];
  if (jar === Jar.prenBTCCRV) {
    tokens = [
      { symbol: Token.renBTC, label: getTokenLabel("renBTC") },
      { symbol: Token.wBTC, label: getTokenLabel("wBTC") },
    ];
  }
  if (jar === Jar.pDAI) {
    tokens = [{ symbol: Token.DAI, label: getTokenLabel("DAI") }];
  }
  if (jar === Jar.p3poolCRV) {
    tokens = [
      { symbol: Token.USDC, label: getTokenLabel("USDC") },
      { symbol: Token.USDT, label: getTokenLabel("USDT") },
    ];
  }

  useEffect(() => {
    if (jar === Jar.prenBTCCRV) setToken(Token.renBTC);
    if (jar === Jar.pDAI) setToken(Token.DAI);
    if (jar === Jar.p3poolCRV) setToken(Token.USDC);
  }, [jar]);

  return (
    <>
      <h3>2. Exit to Token</h3>
      <h4>From Jar</h4>
      <Select
        size="large"
        width="100%"
        style={{ maxWidth: "100%" }}
        value={jar}
        onChange={(e) => setJar(e.toString() as Jar)}
      >
        {jars.map((f) => (
          <Select.Option
            style={{ fontSize: "1rem" }}
            value={f.symbol}
            key={f.symbol}
          >
            <div style={{ display: `flex`, alignItems: `center` }}>
              {f.label}
            </div>
          </Select.Option>
        ))}
      </Select>
      <h4>To Token</h4>
      <Select
        size="large"
        width="100%"
        style={{ maxWidth: "100%" }}
        value={token}
        onChange={(e) => setToken(e.toString() as Token)}
      >
        {tokens.map((f) => (
          <Select.Option
            style={{ fontSize: "1rem" }}
            value={f.symbol}
            key={f.symbol}
          >
            <div style={{ display: `flex`, alignItems: `center` }}>
              {f.label}
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
        <div>Balance: {balance !== null ? formatValue(balance) : 0}</div>
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
        onClick={handleExit}
        disabled={isDisabled()}
      >
        {txState || "Exit to Token"}
      </Button>
    </>
  );
};
