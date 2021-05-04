import Link from "next/link";
import { FC } from "react";
import { JAR_FARM_MAP } from "../../containers/Farms/farms";
import { Card, Table, Tooltip } from "@geist-ui/react";
import { Farms } from "../../containers/Farms";
import { PICKLE_ETH_FARM } from "../../containers/Farms/farms";
import { Jars } from "../../containers/Jars-Polygon";
import { JarApy } from "../../containers/Jars-Ethereum/useJarsWithAPY";
import { useUniPairDayData } from "../../containers/Jars-Ethereum/useUniPairDayData";

export const SummaryCard: FC = () => {
  const { farms } = Farms.useContainer();
  const { jars } = Jars.useContainer();
  const { getUniPairDayAPY } = useUniPairDayData();

  const data = (farms || [])
    .filter((x) => x.apy !== 0)
    .map((farm) => {
      let APYs: JarApy[] = [{ pickle: farm.apy * 100 }];

      const maybeJar = JAR_FARM_MAP[farm.lpToken as keyof typeof JAR_FARM_MAP];
      if (jars && maybeJar) {
        const farmingJar = jars.filter(
          (x) => x.jarName === maybeJar.jarName,
        )[0];
        // eslint-ignore-next-line
        APYs = [...APYs, ...farmingJar.APYs];
      }

      // ETH-PICKLE pool
      // Reason its here is because UNI-LP is usually done on the Jar side
      // But since ETH-PICKLE is farm native, its a special case
      if (farm.lpToken.toLowerCase() === PICKLE_ETH_FARM.toLowerCase()) {
        APYs = [...APYs, ...getUniPairDayAPY(PICKLE_ETH_FARM)];
      }

      const tooltipText = APYs.map((x) => {
        const k = Object.keys(x)[0];
        const v = Object.values(x)[0];
        return `${k}: ${v.toFixed(2)}%`;
      }).join(" + ");

      const totalAPY = APYs.map((x) => {
        return Object.values(x).reduce((acc, y) => acc + y, 0);
      }).reduce((acc, x) => acc + x, 0);

      return {
        ...farm,
        totalAPY: (
          <Tooltip text={farm.apy === 0 ? "--" : tooltipText}>
            {farm.apy === 0 ? "--%" : totalAPY.toFixed(2) + "%"}
          </Tooltip>
        ),
      };
    });
  const sortedData = data.sort((a, b) => b.apy - a.apy);

  const totalLocked = (farms || [])
    .filter((x) => x.apy !== 0)
    .reduce((acc, x) => {
      return acc + parseFloat(x.valueStakedInFarm.toFixed(2));
    }, 0);

  return (
    <Card>
      <Link href="/farms">
        <h2 style={{ cursor: "pointer", display: "inline-block" }}>
          Farms (active)
        </h2>
      </Link>
      <div style={{ paddingBottom: `1rem` }}>
        Total locked: ${totalLocked.toLocaleString()}
      </div>
      <Table data={sortedData}>
        <Table.Column prop="poolName" label="name" />
        <Table.Column prop="tokenName" label="deposit token" />
        <Table.Column prop="totalAPY" label="Total APY" />
      </Table>
    </Card>
  );
};
