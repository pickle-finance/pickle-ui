import { FC, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { PickleFinancePage } from "v2/types";
import { useAppSelector } from "v2/store";
import { CoreSelectors } from "v2/store/core";

import ChainSelect, { ChainSelectData } from "v2/features/stats/ChainSelect";
import JarSelect, { JarSelectData } from "v2/features/stats/JarSelect";
import Breadcrumbs from "v2/features/stats/Breadcrumbs";
import ChainStats from "v2/features/stats/ChainStats";
import JarStats from "v2/features/stats/JarStats";
import PlatformStats from "v2/features/stats/PlatformStats";
import Image from "next/image";

const Stats: PickleFinancePage = () => {
  const core = useAppSelector(CoreSelectors.selectCore);
  const [chain, setChain] = useState({} as ChainSelectData);
  const [jar, setJar] = useState({} as JarSelectData);
  const [page, setPage] = useState<"platform" | "chain" | "jar">();
  const [ready, setReady] = useState({ platform: false, chain: false, jar: false });

  useEffect(() => {
    Object.keys(jar).length === 0
      ? Object.keys(chain).length === 0
        ? setPage("platform")
        : setPage("chain")
      : setPage("jar");
  }, [chain, jar]);

  const props = {
    core: core,
    chain: chain,
    setChain: setChain,
    jar: jar,
    setJar: setJar,
    ready,
    setReady,
    page,
    setPage,
  };

  return (
    <div className="block lg:flex mb-8 sm:mb-10">
      <div className="w-full mb-4">
        <Breadcrumbs {...props} />
        <div className="flex gap-5">
          <ChainSelect {...props} />
          <JarSelect {...props} />
        </div>
        <PlatformStats {...props} />
        <ChainStats {...props} />
        <JarStats {...props} />
        <Loading {...props} />
      </div>
    </div>
  );
};

const Loading: FC<{ ready: readyState; page?: "platform" | "chain" | "jar" }> = ({
  ready,
  page,
}) => {
  if (page && ready[page] === false)
    return (
      <div className="flex justify-center items-center py-8 lg:py-32">
        <div className="bg-background-light border border-foreground-alt-300 rounded-xl w-96 h-96">
          <div className="flex justify-center mt-5">
            <Image
              loading="eager"
              src="/animations/waiting.gif"
              alt="Loading..."
              width={250}
              height={250}
            />
          </div>
          <p className="text-xl text-center text-foreground-alt-200 mt-10">Loading Chart Data</p>
        </div>
      </div>
    );
  return null;
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

export interface readyState {
  platform: boolean;
  chain: boolean;
  jar: boolean;
}

Stats.PageTitle = PageTitle;

export { getStaticProps } from "v1/util/locales";

export default Stats;
