import { FC, useState } from "react";
import { Select, Spacer, Link, Input, Button } from "@geist-ui/react";
import { getLPLabel } from "./tokens";
import { Farm } from "./farms";
import { useExitToJar } from "./useExitToJar";

const formatValue = (numStr: string) =>
  parseFloat(numStr).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: parseFloat(numStr) < 1 ? 18 : 4,
  });

export const ExitToJar: FC = () => {
  const [farm, setFarm] = useState<Farm>(Farm.PRENCRV);
  const [amount, setAmount] = useState<string>("");
  const [txState, setTxState] = useState<string | null>(null);

  const { balance, exit } = useExitToJar(farm);
  const setToMax = (e: any) => {
    e.preventDefault();
    balance !== null && setAmount(balance);
  };

  const handleExit = async () => {
    try {
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

  const farms = [
    { symbol: Farm.PRENCRV, label: getLPLabel("renBTCCRV") },
    { symbol: Farm.P3CRV, label: getLPLabel("3poolCRV") },
    { symbol: Farm.PDAI, label: getLPLabel("pDAI") },
  ];
  return (
    <>
      <h3>1. Exit to Jar</h3>
      <Select
        size="large"
        width="100%"
        style={{ maxWidth: "100%" }}
        value={farm}
        onChange={(e) => setFarm(e.toString() as Farm)}
      >
        {farms.map((f) => (
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
        {txState || "Exit to Jar"}
      </Button>
    </>
  );
};
