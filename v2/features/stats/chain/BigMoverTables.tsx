import { FC } from "react";
import { formatPercentage } from "v2/utils";
import BigMoverTableHead from "./BigMoverTableHead";

export const GainsTable: FC<{ data: tokenPriceChange[] }> = ({ data }) => (
  <table className="w-1/2 inline-table">
    <BigMoverTableHead colB="v2.stats.chain.bigMoversTableHeader.gain" />
    <tbody className="border border-foreground-alt-400 text-center">
      {data.slice(0, 5).map((data) => (
        <tr key={"apiKey"}>
          <td>{data.apiKey}</td>
          <td>{formatPercentage(data.tokenPriceChange, 3)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export const LossesTable: FC<{ data: tokenPriceChange[] }> = ({ data }) => (
  <table className="w-1/2 inline-table">
    <BigMoverTableHead colB="v2.stats.chain.bigMoversTableHeader.loss" />
    <tbody className="border border-foreground-alt-400 text-center">
      {data.slice(-5).map((data) => (
        <tr key={"apiKey"}>
          <td>{data.apiKey}</td>
          <td>{formatPercentage(data.tokenPriceChange * 100, 3)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

interface tokenPriceChange {
  apiKey: string;
  tokenPriceChange: number;
}
