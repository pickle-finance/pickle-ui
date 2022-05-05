import { FC } from "react";
import { formatDollars, formatPercentage } from "v2/utils";
import BigMoverTableHead from "./BigMoverTableHead";
import { iBigMoverTableData } from "./BigMoverUtils";

export const TokenGainsTable: FC<{ data: iBigMoverTableData[] }> = ({ data }) => (
  <table className="w-full inline-table">
    <BigMoverTableHead colB="v2.stats.chain.bigMoversTableHeader.gain" />
    <tbody className="border border-foreground-alt-400">
      {data.slice(0, 5).map((data) => (
        <tr className="pb-2" key={"apiKey"}>
          <td className="text-left pl-20 pt-2">{data.apiKey}</td>
          <td className="text-left pl-20 pt-2">
            {data.tokenPriceChange !== undefined
              ? formatPercentage(data.tokenPriceChange * 100, 3)
              : "error"}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export const TokenLossesTable: FC<{ data: iBigMoverTableData[] }> = ({ data }) => (
  <table className="w-full inline-table">
    <BigMoverTableHead colB="v2.stats.chain.bigMoversTableHeader.loss" />
    <tbody className="border border-foreground-alt-400 text-left">
      {data
        .reverse()
        .slice(0, 5)
        .map((data) => (
          <tr key={"apiKey"}>
            <td className="text-left pl-20 pt-2">{data.apiKey}</td>
            <td className="text-left pl-20 pt-2">
              {data.tokenPriceChange !== undefined
                ? formatPercentage(data.tokenPriceChange * 100, 3)
                : "error"}
            </td>
          </tr>
        ))}
    </tbody>
  </table>
);

export const TvlGainsTable: FC<{ data: iBigMoverTableData[] }> = ({ data }) => (
  <table className="w-full inline-table">
    <BigMoverTableHead colB="v2.stats.chain.bigMoversTableHeader.gain" />
    <tbody className="border border-foreground-alt-400">
      {data.slice(0, 5).map((data) => (
        <tr key={"apiKey"}>
          <td className="text-left pl-20 pt-2">{data.apiKey}</td>
          <td className="text-left pl-20 pt-2">
            {data.tvlChange !== undefined ? formatDollars(data.tvlChange, 2) : "error"}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export const TvlLossesTable: FC<{ data: iBigMoverTableData[] }> = ({ data }) => (
  <table className="w-full inline-table">
    <BigMoverTableHead colB="v2.stats.chain.bigMoversTableHeader.loss" />
    <tbody className="border border-foreground-alt-400 text-left">
      {data
        .reverse()
        .slice(0, 5)
        .map((data) => (
          <tr key={"apiKey"}>
            <td className="text-left pl-20 pt-2">{data.apiKey}</td>
            <td className="text-left pl-20 pt-2">
              {data.tvlChange !== undefined ? formatDollars(data.tvlChange, 2) : "error"}
            </td>
          </tr>
        ))}
    </tbody>
  </table>
);
