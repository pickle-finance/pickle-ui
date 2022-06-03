import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import { PickleFinancePage } from "v2/types";
import { useAppSelector } from "v2/store";
import { CoreSelectors } from "v2/store/core";

import ChainSelect, { ChainSelectData } from "v2/features/stats/ChainSelect";
import JarSelect, { JarSelectData } from "v2/features/stats/JarSelect";
import Breadcrumbs from "v2/features/stats/Breadcrumbs";
import ChainStats from "v2/features/stats/chain";
import JarStats from "v2/features/stats/jar";
import PlatformStats from "v2/features/stats/platform";

const Stats: PickleFinancePage = () => {
  const core = useAppSelector(CoreSelectors.selectCore);

  const [chain, setChain] = useState({} as ChainSelectData);
  const [jar, setJar] = useState({} as JarSelectData);

  return (
    <div className="block lg:flex mb-8 sm:mb-10">
      <div className="w-full mb-4">
        <Breadcrumbs chain={chain} jar={jar} setChain={setChain} setJar={setJar} />
        <div className="flex gap-5">
          <ChainSelect chain={chain} setChain={setChain} setJar={setJar} />
          <JarSelect core={core} chain={chain} jar={jar} setJar={setJar} />
        </div>
        <PlatformStats chain={chain} jar={jar} />
        <ChainStats core={core} chain={chain} jar={jar} />
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
