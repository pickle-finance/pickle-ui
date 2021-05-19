import { FC } from "react";
import { Card, Table, Tooltip } from "@geist-ui/react";
import Link from "next/link";

import { Jars } from "../../containers/Jars-Ethereum";

export const SummaryCard: FC = () => {
  const { jars } = Jars.useContainer();

  const jarData = jars?.map((jar) => {
    const tooltipText = jar?.APYs.map((x) => {
      const k = Object.keys(x)[0];
      const v = Object.values(x)[0];
      return `${k}: ${v.toFixed(2)}%`;
    }).join(" + ");

    return {
      ...jar,
      totalAPY: (
        <Tooltip text={tooltipText}>
          {jar?.totalAPY.toFixed(2) + "%" || "--"}
        </Tooltip>
      ),
    };
  });

  const totalLocked = (jars || []).reduce((acc, jar) => {
    return acc + (jar.tvlUSD || 0);
  }, 0);

  return (
    <Card>
      <Link href="/jars">
        <h2 style={{ cursor: "pointer", display: "inline-block" }}>Jars</h2>
      </Link>
      <div style={{ paddingBottom: `1rem` }}>
        Total locked (AUM): ${totalLocked.toLocaleString()}
      </div>
      <Table data={jarData}>
        <Table.Column prop="jarName" label="name" />
        <Table.Column prop="depositTokenName" label="deposit token" />
        <Table.Column prop="totalAPY" label="APY" />
      </Table>
    </Card>
  );
};
