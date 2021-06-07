import { FC } from "react";
import { Card, Table, Tooltip, Spacer } from "@geist-ui/react";
import { getLPLabel, getTokenLabel } from "./tokens";
import { useInfoAPYs } from "./useInfoAPYs";
import { getAPYTooltip } from "./getAPYTooltip";
import { useFarmBalances } from "./useFarmBalances";

const formatNumber = (num?: number) => {
  if (!num) return "--";
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: num < 1 ? 6 : 4,
  });
};

const formatDollar = (num?: number) => {
  if (!num) return "--";
  return (
    "$" +
    num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

export const Info: FC = () => {
  const { prenCRVAPYs, p3CRVAPYs, pDAIAPYs } = useInfoAPYs();
  const { prenCRVData, p3CRVData, pDAIData } = useFarmBalances();

  const data = [
    {
      token: getTokenLabel("renBTC"),
      jar: getLPLabel("renBTCCRV"),
      totalApy: getAPYTooltip(prenCRVAPYs),
      stakedValue: formatDollar(prenCRVData?.stakedValue),
      pendingPickle: formatNumber(prenCRVData?.pendingPickle),
      totalValue: formatDollar(prenCRVData?.totalValue),
    },
    {
      token: getTokenLabel("wBTC"),
      jar: getLPLabel("renBTCCRV"),
      totalApy: getAPYTooltip(prenCRVAPYs),
      stakedValue: formatDollar(prenCRVData?.stakedValue),
      pendingPickle: formatNumber(prenCRVData?.pendingPickle),
      totalValue: formatDollar(prenCRVData?.totalValue),
    },
    // {
    //   token: getTokenLabel("DAI"),
    //   jar: getLPLabel("pDAI"),
    //   totalApy: getAPYTooltip(pDAIAPYs),
    //   stakedValue: formatDollar(pDAIData?.stakedValue),
    //   pendingPickle: formatNumber(pDAIData?.pendingPickle),
    //   totalValue: formatDollar(pDAIData?.totalValue),
    // },
    {
      token: getTokenLabel("USDC"),
      jar: getLPLabel("3poolCRV"),
      totalApy: getAPYTooltip(p3CRVAPYs),
      stakedValue: formatDollar(p3CRVData?.stakedValue),
      pendingPickle: formatNumber(p3CRVData?.pendingPickle),
      totalValue: formatDollar(p3CRVData?.totalValue),
    },
    {
      token: getTokenLabel("USDT"),
      jar: getLPLabel("3poolCRV"),
      totalApy: getAPYTooltip(p3CRVAPYs),
      stakedValue: formatDollar(p3CRVData?.stakedValue),
      pendingPickle: formatNumber(p3CRVData?.pendingPickle),
      totalValue: formatDollar(p3CRVData?.totalValue),
    },
  ];

  return (
    <Card>
      <h2>Single-Asset to Farm</h2>
      <Table data={data}>
        <Table.Column prop="token" label="Input Token" />
        <Table.Column prop="jar" label="Jar + Farm" />
        <Table.Column prop="totalApy" label="Total APY" />
        <Table.Column prop="stakedValue" label="Staked Value" />
        <Table.Column prop="pendingPickle">
          <Tooltip text="You can harvest your Pending Pickles on the Farms page.">
            <span style={{ cursor: "help" }}>PP ❓</span>
          </Tooltip>
        </Table.Column>
        <Table.Column prop="totalValue">
          <Tooltip text="Staked value + the value of your pending pickles.">
            <span style={{ cursor: "help" }}>Total Value ❓</span>
          </Tooltip>
        </Table.Column>
      </Table>
      <Spacer />
      <p>
        <strong>Note:</strong> "staked value", "pending pickles", and "total
        value" are unique to each jar + farm combination.
        <br />
        Therefore, you may see duplicate values for tokens that share the same
        pool.
      </p>
    </Card>
  );
};
