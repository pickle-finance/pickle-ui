import React, { FC, useState } from "react";
import styled from "styled-components";
import { Spacer, Grid, Checkbox, Button } from "@geist-ui/react";
import { useTranslation } from "next-i18next";

import { UserMiniFarms } from "../../containers/UserMiniFarms";
import { Connection } from "../../containers/Connection";
import { useJarData } from "features/Gauges/useJarData";
import { JarMiniFarmCollapsible } from "./JarMiniFarmCollapsible";
import { JarCollapsible } from "./JarCollapsible";
import { uncompoundAPY } from "../../util/jars";
import { NETWORK_NAMES } from "containers/config";
import { BalFarm } from "../PickleFarms/BalFarm";
import { pickleWhite } from "util/constants";
import { FarmsIntro } from "components/FarmsIntro";
import { PickleCore } from "containers/Jars/usePickleCore";
import { getJarFarmMap } from "containers/Farms/farms";
import { isJarDisabled, isJarActive } from "containers/Jars/jars";
import { noFarms } from "util/constants";

const Container = styled.div`
  padding-top: 1.5rem;
`;

export interface JarApy {
  [k: string]: number;
}

export const MiniFarmList: FC = () => {
  const { signer, chainName } = Connection.useContainer();
  let { farmData } = UserMiniFarms.useContainer();
  const { jarData } = useJarData();
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);
  const { t } = useTranslation("common");
  const { pickleCore } = PickleCore.useContainer();

  const noFarm = noFarms(chainName);
  farmData = noFarm ? [] : farmData;

  if (!signer) return <h2>{t("connection.connectToContinue")}</h2>;

  if ((!jarData || !farmData) && chainName !== NETWORK_NAMES.POLY) {
    return <h2>{t("connection.loading")}</h2>;
  } else if ((!jarData || !farmData) && chainName === NETWORK_NAMES.POLY) {
    return (
      <>
        <h2>{t("connection.loading")}</h2>
        <span style={{ color: pickleWhite }}>
          {t("connection.polygonRpc")}
        </span>{" "}
      </>
    );
  }
  const farmsWithAPY = (farmData ? farmData : []).map((farm) => {
    let APYs: JarApy[] = [{ pickle: farm.apy * 100 }];

    const jar = getJarFarmMap(pickleCore)[farm.depositToken.address];
    if (jar) {
      const farmingJar = jarData
        ? jarData.filter((x) => x.name === jar.jarName)[0]
        : undefined;
      APYs = farmingJar?.APYs ? [...APYs, ...farmingJar.APYs] : APYs;
    }

    const uncompounded = APYs.map((x) => {
      const k: string = Object.keys(x)[0];
      const shouldNotUncompound = k === "pickle" || k === "lp";
      const v = shouldNotUncompound
        ? Object.values(x)[0]
        : uncompoundAPY(Object.values(x)[0]);
      const ret: JarApy = {};
      ret[k] = v;
      return ret;
    });

    const totalAPY: number = APYs.map((x) => {
      return Object.values(x).reduce((acc, y) => acc + y, 0);
    }).reduce((acc, x) => acc + x, 0);
    const totalAPR: number = uncompounded
      .map((x) => {
        return Object.values(x).reduce((acc, y) => acc + y, 0);
      })
      .reduce((acc, x) => acc + x, 0);
    const difference = totalAPY - totalAPR;

    const tooltipText = [
      `${t("farms.baseAPRs")}:`,
      ...uncompounded.map((x) => {
        const k = Object.keys(x)[0];
        const v = Object.values(x)[0];
        return `${k}: ${v.toFixed(2)}%`;
      }),
      `${t(
        "farms.compounding",
      )} <img src="/magicwand.svg" height="16" width="16"/>: ${difference.toFixed(
        2,
      )}%`,
    ]
      .filter((x) => x)
      .join(" <br/> ");

    return {
      ...farm,
      APYs,
      totalAPY,
      tooltipText,
    };
  });

  const protocolList = [...new Set(jarData?.map((x) => x.protocol))];

  const activeJars = !jarData
    ? []
    : jarData
        .filter((jar) => isJarActive(jar.apiKey, pickleCore))
        .sort((a, b) => b.totalAPY - a.totalAPY);

  const protocolJars = activeJars.filter(
    (jar) => jar.protocol === selectedProtocol,
  );

  const inactiveJars = !jarData
    ? []
    : jarData.filter((jar) => {
        const foundJar = pickleCore?.assets.jars.find(
          (x) =>
            x.contract.toLowerCase() === jar.jarContract.address.toLowerCase(),
        );
        return (
          foundJar === undefined ||
          isJarDisabled(foundJar.details.apiKey, pickleCore)
        );
      });

  return (
    <Container>
      {chainName === NETWORK_NAMES.ARB && (
        <>
          <BalFarm />
          <Spacer y={1} />
        </>
      )}
      <Grid.Container gap={1}>
        <Grid md={16}>
          <FarmsIntro />
        </Grid>
        <Grid md={8} style={{ textAlign: "right" }}>
          <Checkbox
            checked={showInactive}
            size="medium"
            onChange={(e) => setShowInactive(e.target.checked)}
          >
            {t("farms.showInactive")}
          </Checkbox>
        </Grid>
      </Grid.Container>
      <Grid.Container gap={1} justify="center">
        <Grid md={6}>
          <Button onClick={() => setSelectedProtocol(null)}>All</Button>
        </Grid>
        {protocolList.map((protocol) => {
          return (
            <Grid md={6}>
              <Button onClick={() => setSelectedProtocol(protocol)}>
                {protocol}
              </Button>
            </Grid>
          );
        })}
      </Grid.Container>
      <Spacer y={1} />
      <Grid.Container gap={1}>
        {(selectedProtocol ? protocolJars : activeJars).map((jar) => {
          const farm = farmsWithAPY.find(
            (x) =>
              x.depositToken.address.toLowerCase() ===
              jar.jarContract.address.toLowerCase(),
          );
          return (
            <Grid xs={24} key={jar.name}>
              {farm && !noFarm && (
                <JarMiniFarmCollapsible farmData={farm} jarData={jar} />
              )}
              {noFarm && <JarCollapsible jarData={jar} />}
            </Grid>
          );
        })}
      </Grid.Container>
      <Spacer y={1} />
      <Grid.Container gap={1}>
        {showInactive && <h2>{t("farms.inactive")}</h2>}
        {showInactive &&
          inactiveJars.map((jar) => {
            const farm = farmsWithAPY.find(
              (x) =>
                x.depositToken.address.toLowerCase() ===
                jar.jarContract.address.toLowerCase(),
            );
            return (
              <Grid xs={24} key={jar.name}>
                {farm && (
                  <JarMiniFarmCollapsible jarData={jar} farmData={farm} />
                )}
              </Grid>
            );
          })}
      </Grid.Container>
    </Container>
  );
};
