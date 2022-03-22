import { FC } from "react";
import BigMoverTableHead from "./BigMoverTableHead";


export const GainsTable: FC <{data: tokenPriceChange[]}> = ({data}) => (
  <table className="w-1/2 inline-table">
    <BigMoverTableHead colB="v2.stats.chain.bigMoversTableHeader.gain"/>
    <tbody className="border border-foreground-alt-400">
      {data.slice(0,5).map(data => (
        <tr key={"apiKey"}>
          <td>{data.apiKey}</td>
          <td>{data.tokenPriceChange}</td>
        </tr>
      ))}
    </tbody>
  </table>
)

export const LossesTable: FC <{data: tokenPriceChange[]}> = ({data}) => (
  <table className="w-1/2 inline-table">
    <BigMoverTableHead colB="v2.stats.chain.bigMoversTableHeader.loss"/>
    <tbody className="border border-foreground-alt-400">
      {data.slice(-5).map(data => (
        <tr key={"apiKey"}>
          <td>{data.apiKey}</td>
          <td>{data.tokenPriceChange}</td>
        </tr>
      ))}
    </tbody>
  </table>
)


interface tokenPriceChange {
  apiKey: string;
  tokenPriceChange: number;
}