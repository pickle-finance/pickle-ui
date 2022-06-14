import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import { PickleFinancePage } from "v2/types";
import { useAppSelector } from "v2/store";
import { CoreSelectors } from "v2/store/core";

import ChainSelect, { ChainSelectData, networksToOptions } from "v2/features/stats/ChainSelect";
import JarSelect, { JarSelectData, coreToOptions } from "v2/features/stats/JarSelect";
import Breadcrumbs from "v2/features/stats/Breadcrumbs";
import ChainStats from "v2/features/stats/ChainStats";
import JarStats from "v2/features/stats/JarStats";
import PlatformStats from "v2/features/stats/PlatformStats";
import { NextRouter, useRouter } from "next/router";
import { useSelector } from "react-redux";

const Stats: PickleFinancePage = () => {
  const core = useAppSelector(CoreSelectors.selectCore);
  const networks = useSelector(CoreSelectors.selectNetworks);
  const chainOptions: ChainSelectData[] = networksToOptions(networks);
  const jarOptions: JarSelectData[] = coreToOptions(core);

  const [chain, setChain] = useState({} as ChainSelectData);
  const [jar, setJar] = useState({} as JarSelectData);

  const router: NextRouter = useRouter();
  const urlChain: string = Array.isArray(router.query.chain)
    ? router.query.chain[0]
    : router.query.chain || "";
  const urlJar: string = Array.isArray(router.query.jar)
    ? router.query.jar[0]
    : router.query.jar || "";
  if (router.isReady && urlChain !== "" && Object.keys(chain).length === 0) {
    for (let n = 0; n < chainOptions.length; n++) {
      if (chainOptions[n].value === urlChain) {
        setChain(chainOptions[n]);
      }
    }
  }
  if (router.isReady && urlJar !== "" && Object.keys(jar).length === 0) {
    const thisJar = core?.assets.jars.find((j) => j.details?.apiKey === urlJar);
    for (let n = 0; n < chainOptions.length; n++) {
      if (thisJar && chainOptions[n].value === thisJar.chain) {
        setChain(chainOptions[n]);
      }
    }
    for (let n = 0; n < jarOptions.length; n++) {
      if (thisJar && jarOptions[n].value === urlJar) {
        setJar(jarOptions[n]);
      }
    }
  }

  return (
    <div className="block lg:flex mb-8 sm:mb-10">
      <div className="w-full mb-4">
        <Breadcrumbs chain={chain} jar={jar} setChain={setChain} setJar={setJar} />
        {router.isReady && (
          <div className="flex gap-5">
            <ChainSelect chain={chain} setChain={setChain} setJar={setJar} />
            <JarSelect core={core} chain={chain} jar={jar} setJar={setJar} />
          </div>
        )}
        <PlatformStats chain={chain} jar={jar} core={core} setChain={setChain} />
        <ChainStats core={core} chain={chain} jar={jar} setJar={setJar} />
        <JarStats core={core} chain={chain} jar={jar} />
      </div>
    </div>
  );
};

const PageTitle: FC = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <h1 className="font-title font-medium text-2xl sm:text-3xl pt-2">{t("v2.nav.stats")}</h1>
      <h2 className="font-body font-normal text-foreground-alt-200 text-sm sm:text-base leading-4 sm:leading-6 mt-1">
        {t("v2.stats.subtitle")}
      </h2>
    </>
  );
};

Stats.PageTitle = PageTitle;

export { getStaticProps } from "v1/util/locales";

export default Stats;
