import { useState, useEffect } from "react";
import * as Sentry from "@sentry/react";

import { Connection } from "../../containers/Connection";
import { Farms } from "../../containers/Farms";
import { FarmWithApy } from "../../containers/Farms/useUniV2Apy";
import { Jars } from "../../containers/Jars";
import { JarApy } from "../../containers/Jars/useCurveCrvAPY";
import { JarWithTVL } from "../../containers/Jars/useJarsWithTVL";

const PTOKEN_ADDR = {
  prenCRV: "0x2E35392F4c36EBa7eCAFE4de34199b2373Af22ec",
  p3CRV: "0x1BB74b5DdC1f4fC91D6f9E7906cf68bc93538e33",
  pDAI: "0x6949Bb624E8e8A90F87cD2058139fcd77D2F3F87",
};

export const useInfoAPYs = () => {
  const { blockNum } = Connection.useContainer();
  const { farms } = Farms.useContainer();
  const { jars } = Jars.useContainer();

  const [prenCRVAPYs, setprenCRVAPYs] = useState<JarApy[] | null>(null);
  const [p3CRVAPYs, setp3CRVAPYs] = useState<JarApy[] | null>(null);
  const [pDAIAPYs, setpDAIAPYs] = useState<JarApy[] | null>(null);

  const fetchAPYs = () => {
    if (farms && jars) {
      // get farms
      const getFarm = (farms: FarmWithApy[], addr: string) =>
        farms.filter((f) => f.lpToken === addr)[0];
      const a = getFarm(farms, PTOKEN_ADDR.prenCRV);
      const b = getFarm(farms, PTOKEN_ADDR.p3CRV);
      const c = getFarm(farms, PTOKEN_ADDR.pDAI);

      // get jars
      const getJar = (jars: JarWithTVL[], addr: string) =>
        jars.filter((j) => j.contract.address === addr)[0];
      const x = getJar(jars, PTOKEN_ADDR.prenCRV);
      const y = getJar(jars, PTOKEN_ADDR.p3CRV);
      const z = getJar(jars, PTOKEN_ADDR.pDAI);

      // add up APYs and set
      setprenCRVAPYs([{ pickle: a.apy * 100 }, ...x.APYs]);
      setp3CRVAPYs([{ pickle: b.apy * 100 }, ...y.APYs]);
      setpDAIAPYs([{ pickle: c.apy * 100 }, ...z.APYs]);
    }
  };

  useEffect(() => {
    try {
      fetchAPYs();
    } catch (err) {
      Sentry.captureException(err);
    }
  }, [jars, blockNum]);

  return { prenCRVAPYs, p3CRVAPYs, pDAIAPYs };
};
