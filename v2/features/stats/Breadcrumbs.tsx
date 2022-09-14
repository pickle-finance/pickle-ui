import { useTranslation } from "next-i18next";
import { NextRouter, useRouter } from "next/router";
import { FC } from "react";
import { toTitleCase } from "v2/utils";
import { ChainSelectData } from "./ChainSelect";
import { JarSelectData } from "./JarSelect";

const BreadCrumbs: FC<{
  chain: ChainSelectData;
  jar: JarSelectData;
  setChain: SetFunction;
  setJar: SetFunction;
}> = ({ chain, jar, setChain, setJar }) => {
  const { t } = useTranslation("common");
  const router: NextRouter = useRouter();

  return (
    <div className="flex">
      <h3
        className={
          "lg:text-xl md:text-md sm:text-sm inline-block cursor-pointer" +
          (Object.keys(chain).length > 0
            ? " text-accent hover:text-primary"
            : " text-foreground-alt-100")
        }
        onClick={() => {
          if (chain && jar) {
            setChain({} as ChainSelectData);
            setJar("");
            router.push("/stats");
          } else if (chain !== ({} as ChainSelectData)) {
            setChain({});
            router.push("/stats");
          } else return;
        }}
      >
        {t("v2.stats.platformStats")}
      </h3>
      {chain && Object.keys(chain).length > 0 && (
        <>
          <p className="text-foreground-alt-100 px-2">{">"}</p>
          <h3
            className={
              "lg:text-xl md:text-md sm:text-sm inline-block cursor-pointer" +
              (Object.keys(jar).length > 0
                ? " text-accent hover:text-primary"
                : " text-foreground-alt-100")
            }
            onClick={() => {
              setJar("");
              router.push(`/stats?chain=${chain.value}`);
            }}
          >
            {toTitleCase(chain.label)}
          </h3>
        </>
      )}
      {Object.keys(jar).length > 0 && (
        <>
          <p className="text-foreground-alt-100 px-2">{">"}</p>
          <h3 className="text-foreground-alt-200 lg:text-xl md:text-md sm:text-sm">{jar.value}</h3>
        </>
      )}
    </div>
  );
};

type SetFunction = (property: any) => void;

export default BreadCrumbs;
