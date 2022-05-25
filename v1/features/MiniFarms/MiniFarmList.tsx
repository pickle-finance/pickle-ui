import React, { FC, useState } from "react";
import styled from "styled-components";
import { Spacer, Grid, Checkbox, Button } from "@geist-ui/react";
import { useTranslation } from "next-i18next";

import { UserMiniFarms } from "../../containers/UserMiniFarms";
import { Connection } from "../../containers/Connection";
import { useJarData } from "v1/features/Gauges/useJarData";
import { JarMiniFarmCollapsible } from "./JarMiniFarmCollapsible";
import { JarCollapsible } from "./JarCollapsible";
import { BalFarm } from "../PickleFarms/BalFarm";
import { UniV3JarMiniFarmCollapsible } from "../UniV3/UniV3JarMiniFarmCollapsible";
import { pickleWhite, someFarms } from "v1/util/constants";
import { FarmsIntro } from "v1/components/FarmsIntro";
import { PickleCore } from "v1/containers/Jars/usePickleCore";
import { useJarFarmMap } from "v1/containers/Farms/farms";
import { isJarDisabled, isJarActive } from "v1/containers/Jars/jars";
import { noFarms } from "v1/util/constants";
import { ChainNetwork, PickleModelJson } from "picklefinance-core";
import {
  AssetAprComponent,
  AssetProtocol,
  JarDefinition,
} from "picklefinance-core/lib/model/PickleModelJson";
import { UserJarData } from "v1/containers/UserJars";
import { formatEther } from "ethers/lib/utils";
import { GreenSwitch } from "v1/features/Gauges/GaugeList";

const Container = styled.div`
  padding-top: 1.5rem;
`;

export interface JarApy {
  [k: string]: number;
}

export const getCompoundingAPY = (apr: number) => {
  // Numbers are assumed to be *100 already. ie, 42% is passed in as 42, not 0.42
  const r = Math.pow(1 + apr / 100 / 365, 365) - 1;
  console.log("compounded " + apr + " to " + r);
  return r;
};

export const findJarDefinition = (
  pickleCore: PickleModelJson.PickleModelJson | null,
  apiKey: string,
): JarDefinition | undefined => {
  const jar: JarDefinition | undefined =
    pickleCore === null
      ? undefined
      : pickleCore.assets.jars.find(
          (x) =>
            x !== undefined &&
            x.details !== undefined &&
            x.details.apiKey !== undefined &&
            x.details.apiKey.toLowerCase() === apiKey.toLowerCase(),
        );
  return jar;
};

export const findJarCompoundingMagic = (jar: JarDefinition): number => {
  if (jar.aprStats !== undefined) {
    return jar.aprStats.apy - jar.aprStats.apr;
  }
  return 0;
};

export const getJarAprPfcore = (jar: JarDefinition): JarApy[] => {
  if (jar !== undefined && jar.aprStats !== undefined) {
    const ret: JarApy[] = jar.aprStats.components.map((x) => {
      const ret: JarApy = {};
      ret[x.name] = x.apr;
      return ret;
    });
    return ret;
  }
  return [];
};

export const getJarApyPfcore = (jar: JarDefinition): JarApy[] => {
  if (jar !== undefined && jar.aprStats !== undefined) {
    const ret: JarApy[] = jar.aprStats.components.map((x) => {
      const ret: JarApy = {};
      ret[x.name] = x.apr;
      if (x.compoundable) {
        ret[x.name] = getCompoundingAPY(x.apr);
      }
      return ret;
    });
    return ret;
  }
  return [];
};

export const sumJarApy = (apys: JarApy[]): number => {
  let total = 0;
  for (let i = 0; i < apys.length; i++) {
    for (const [_key, value] of Object.entries(apys[i])) {
      total += value;
    }
  }
  return total;
};

export const nonCompoundedYieldsToTooltip = (
  apr: JarApy[],
  compounding: number,
  t: any,
  chainName: ChainNetwork,
): string => {
  const beginning = `${t("farms.baseAPRs")}:`;
  const elements: string[] = apr.map((x) => {
    let k = Object.keys(x)[0];
    if (chainName === ChainNetwork.Metis && k === "pickle") k = "Metis";
    const v = Object.values(x)[0];
    return `${k}: ${v.toFixed(2)}%`;
  });
  const compoundingNumStr: string = compounding.toFixed(2);
  const compoundingStr: string = `${t(
    "farms.compounding",
  )} <img src="/magicwand.svg" height="16" width="16"/>: ${compoundingNumStr}%`;
  const finalArr = [beginning].concat(elements).concat([compoundingStr]);
  return finalArr.filter((x) => x).join(" <br/> ");
};

export const MiniFarmList: FC = () => {
  const { signer, chainName } = Connection.useContainer();
  let { farmData } = UserMiniFarms.useContainer();
  const { jarData } = useJarData();
  const jarFarmMap = useJarFarmMap();

  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);
  const [showUserJars, setShowUserJars] = useState<boolean>(false);
  const { t } = useTranslation("common");
  const { pickleCore } = PickleCore.useContainer();
  const noFarm = noFarms(chainName);
  const someFarm = someFarms(chainName);
  farmData = noFarm ? [] : farmData;

  if (!signer) return <h2>{t("connection.connectToContinue")}</h2>;

  if ((!jarData || !farmData) && chainName !== ChainNetwork.Polygon) {
    return <h2>{t("connection.loading")}</h2>;
  } else if ((!jarData || !farmData) && chainName === ChainNetwork.Polygon) {
    return (
      <>
        <h2>{t("connection.loading")}</h2>
        <span style={{ color: pickleWhite }}>{t("connection.polygonRpc")}</span>{" "}
      </>
    );
  }
  const farmsWithAPY = (farmData ? farmData : []).map((farm) => {
    const pickleRewards: JarApy = { pickle: farm.apy * 100 };
    // Older var im trying to replace, but too scared to do so
    let APYs: JarApy[] = [pickleRewards];

    let nonCompoundedYields: JarApy[] = [pickleRewards];
    let totalAPY = 0;
    let magicCompounding = 0;
    const jar = jarFarmMap[farm.depositToken.address];
    if (jar) {
      const farmingJar: UserJarData | undefined = jarData
        ? jarData.filter((x) => x.name === jar.jarName)[0]
        : undefined;
      if (farmingJar && farmingJar.apiKey) {
        if (farmingJar && farmingJar.APYs) {
          APYs = [...APYs, ...farmingJar.APYs];
        }
        const jardef: JarDefinition | undefined = findJarDefinition(pickleCore, farmingJar.apiKey);
        if (jardef !== undefined) {
          let farmApyToUse = farm.apy * 100;
          nonCompoundedYields = nonCompoundedYields.concat(getJarAprPfcore(jardef));
          if (jardef.aprStats !== undefined) {
            const farmApyComponents = jardef.farm?.details?.farmApyComponents;
            if (farmApyComponents !== undefined) {
              const farmApy: AssetAprComponent | undefined = farmApyComponents.find(
                (x) => x.name.toLowerCase() === "pickle",
              );
              if (farmApy !== undefined) {
                farmApyToUse = farmApy.apr;
              }

              // Can delete this chunk after Metis promo
              if (chainName === ChainNetwork.Metis) {
                const wbtcApr = farm.maticValuePerYear / (jardef?.farm?.details?.valueBalance || 1);
                nonCompoundedYields = [
                  ...nonCompoundedYields,
                  {
                    Wbtc: wbtcApr,
                  },
                ];
                totalAPY += wbtcApr;
              }
            }
            totalAPY += jardef.aprStats.apy + farmApyToUse;
            magicCompounding = jardef.aprStats.apy - jardef.aprStats.apr;
          }
        }
      }
    }

    const tooltipText = nonCompoundedYieldsToTooltip(
      nonCompoundedYields,
      magicCompounding,
      t,
      chainName as ChainNetwork,
    );
    return {
      ...farm,
      APYs: APYs,
      totalAPY,
      tooltipText,
    };
  });

  const protocolList = [
    ...new Set(
      jarData?.map((x) => {
        return x.stakingProtocol ?? x.protocol;
      }),
    ),
  ];

  const activeJars = !jarData
    ? []
    : jarData
        .filter((jar) => isJarActive(jar.apiKey, pickleCore))
        .sort((a, b) => b.totalAPY - a.totalAPY)
        .filter(
          (jar) => isJarActive(jar.apiKey, pickleCore) && jar.protocol != AssetProtocol.UNISWAP_V3,
        )
        .sort((a, b) => b.totalAPY - a.totalAPY);

  const userJars = jarData?.filter((jar) => {
    const farm = farmsWithAPY.find(
      (x) => x.depositToken.address.toLowerCase() === jar.jarContract.address.toLowerCase(),
    );
    return parseFloat(formatEther(jar.deposited)) || parseFloat(formatEther(farm?.staked || 0));
  });

  const uniV3Jars = jarData?.filter((jar) => jar.protocol == AssetProtocol.UNISWAP_V3);

  const protocolJars = (showUserJars ? userJars : activeJars)?.filter((jar) => {
    const stakingProtocol = jar.stakingProtocol;
    if (stakingProtocol) return stakingProtocol === selectedProtocol;
    return jar.protocol === selectedProtocol;
  });

  const inactiveJars = !jarData
    ? []
    : jarData.filter((jar) => {
        const foundJar = pickleCore?.assets.jars.find(
          (x) => x.contract.toLowerCase() === jar.jarContract.address.toLowerCase(),
        );
        return foundJar === undefined || isJarDisabled(foundJar.details.apiKey, pickleCore);
      });

  return (
    <Container>
      {chainName === ChainNetwork.Arbitrum && (
        <>
          <BalFarm />
          <Spacer y={1} />
        </>
      )}
      <Grid.Container gap={1}>
        <Grid md={14}>
          <FarmsIntro />
        </Grid>
        <Grid md={10} style={{ textAlign: "right" }}>
          <Checkbox
            checked={showInactive}
            size="medium"
            onChange={(e) => setShowInactive(e.target.checked)}
          >
            {t("farms.showInactive")}
          </Checkbox>
          <GreenSwitch
            style={{ top: "-2px" }}
            checked={showUserJars}
            onChange={() => setShowUserJars(!showUserJars)}
          />
          {t("farms.showMyJars")}
        </Grid>
      </Grid.Container>
      <Grid.Container gap={1} justify="center">
        <Grid md={6}>
          <Button onClick={() => setSelectedProtocol(null)}>All</Button>
        </Grid>
        {protocolList.map((protocol) => {
          return (
            <Grid md={6}>
              <Button onClick={() => setSelectedProtocol(protocol)}>{protocol}</Button>
            </Grid>
          );
        })}
      </Grid.Container>
      <Spacer y={1} />
      <Grid.Container gap={1}>
        {uniV3Jars?.map((jar) => {
          const farm = farmsWithAPY.find(
            (x) => x.depositToken.address.toLowerCase() === jar.jarContract.address.toLowerCase(),
          );
          return (
            <Grid xs={24} key={jar.name}>
              <UniV3JarMiniFarmCollapsible jarData={jar} farmData={farm} />
            </Grid>
          );
        })}
        {(selectedProtocol ? protocolJars : showUserJars ? userJars : activeJars)?.map((jar) => {
          const farm = farmsWithAPY.find(
            (x) => x.depositToken.address.toLowerCase() === jar.jarContract.address.toLowerCase(),
          );
          return (
            <Grid xs={24} key={jar.name}>
              {farm && !noFarm && !someFarm && (
                <JarMiniFarmCollapsible farmData={farm} jarData={jar} />
              )}
              {noFarm && <JarCollapsible jarData={jar} />}
              {someFarm && farm && <JarMiniFarmCollapsible farmData={farm} jarData={jar} />}
              {someFarm && !farm && <JarCollapsible jarData={jar} />}
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
              (x) => x.depositToken.address.toLowerCase() === jar.jarContract.address.toLowerCase(),
            );
            return (
              <Grid xs={24} key={jar.name}>
                {farm && <JarMiniFarmCollapsible jarData={jar} farmData={farm} />}
              </Grid>
            );
          })}
      </Grid.Container>
    </Container>
  );
};
