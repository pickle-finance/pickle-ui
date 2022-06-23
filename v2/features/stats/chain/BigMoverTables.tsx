import { FC } from "react";
import { formatDollars, formatPercentage } from "v2/utils";
import BigMoverTableHead from "./BigMoverTableHead";
import { iBigMoverTableData } from "./BigMoverUtils";

export const TvlGainsTable: FC<{ data: iBigMoverTableData[] }> = ({ data }) => (
  <table className="w-full">
    <BigMoverTableHead colB="v2.stats.chain.bigMoversTableHeader.gain" />
    <tbody className="border border-foreground-alt-400">
      {data
        .slice(-5)
        .reverse()
        .map((data) => (
          <tr className="text-foreground-alt-100" key={"apiKey"}>
            <td className="text-left xl:pl-20 lg:pl-20 md:pl-10 sm:pl-10 pt-2">{data.apiKey}</td>
            <td className="text-left xl:pl-20 lg:pl-20 md:pl-10 sm:pl-10 pt-2 pr-2">
              {data.tvlChange !== undefined ? formatDollars(data.tvlChange, 2) : "error"}
            </td>
          </tr>
        ))}
    </tbody>
  </table>
);

export const TvlLossesTable: FC<{ data: iBigMoverTableData[] }> = ({ data }) => (
  <table className="w-full sm:mt-5">
    <BigMoverTableHead colB="v2.stats.chain.bigMoversTableHeader.loss" />
    <tbody className="border border-foreground-alt-400 text-left">
      {data.slice(0, 5).map((data) => (
        <tr className="text-foreground-alt-100" key={"apiKey"}>
          <td className="text-left xl:pl-20 lg:pl-20 md:pl-10 sm:pl-10 pt-2">{data.apiKey}</td>
          <td className="text-left xl:pl-20 lg:pl-20 md:pl-10 sm:pl-10 pt-2 pr-2">
            {data.tvlChange !== undefined ? formatDollars(data.tvlChange, 2) : "error"}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export const TokenGainsTable: FC<{ data: iBigMoverTableData[] }> = ({ data }) => (
  <table className="w-full">
    <BigMoverTableHead colB="v2.stats.chain.bigMoversTableHeader.gain" />
    <tbody className="border border-foreground-alt-400">
      {data
        .slice(-5)
        .reverse()
        .map((data) => (
          <tr className="text-foreground-alt-100" key={"apiKey"}>
            <td className="text-left xl:pl-20 lg:pl-20 md:pl-10 sm:pl-10 pt-2">{data.apiKey}</td>
            <td className="text-left xl:pl-20 lg:pl-20 md:pl-10 sm:pl-10 pt-2 pr-2">
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
  <table className="w-full sm:mt-5">
    <BigMoverTableHead colB="v2.stats.chain.bigMoversTableHeader.loss" />
    <tbody className="border border-foreground-alt-400 text-left">
      {data.slice(0, 5).map((data) => (
        <tr className="text-foreground-alt-100" key={"apiKey"}>
          <td className="text-left xl:pl-20 lg:pl-20 md:pl-10 sm:pl-10 pt-2">{data.apiKey}</td>
          <td className="text-left xl:pl-20 lg:pl-20 md:pl-10 sm:pl-10 pt-2 pr-2">
            {data.tokenPriceChange !== undefined
              ? formatPercentage(data.tokenPriceChange * 100, 3)
              : "error"}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
