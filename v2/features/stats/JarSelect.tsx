import { FC, useEffect, useState } from "react";
import Select, { SingleValue, StylesConfig } from "react-select";
import { ChainNetwork, PickleModelJson } from "picklefinance-core";
import { AssetEnablement, JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";
import { ChainSelectData, networksToOptions } from "./ChainSelect";
import { NextRouter, useRouter } from "next/router";
import { useSelector } from "react-redux";
import { CoreSelectors } from "v2/store/core";
import { SetFunction } from "v2/types";

export const JarSelect: FC<{
  core: PickleModelJson.PickleModelJson | undefined;
  chain: ChainSelectData;
  jar: JarSelectData;
  setJar: SetJarFunction;
  setChain: SetChainFunction;
  setPage: SetFunction;
}> = ({ core, chain, jar, setJar, setChain, setPage }) => {
  const [options, setOptions] = useState<JarSelectData[]>([]);
  const networks = useSelector(CoreSelectors.selectNetworks);
  const chainOptions: ChainSelectData[] = networksToOptions(networks);
  const router: NextRouter = useRouter();

  const urlJar: string = Array.isArray(router.query.jar)
    ? router.query.jar[0]
    : router.query.jar || "";

  if (router.isReady && urlJar !== "" && Object.keys(jar).length === 0) {
    const thisJar = core?.assets.jars.find(
      (j) => j.details?.apiKey.toLowerCase() === urlJar.toLowerCase(),
    );
    for (let n = 0; n < chainOptions.length; n++) {
      if (thisJar && chainOptions[n].value === thisJar.chain) {
        setChain(chainOptions[n]);
      }
    }
    for (let n = 0; n < options.length; n++) {
      if (thisJar && options[n].value.toLowerCase() === urlJar.toLowerCase()) {
        setJar(options[n]);
      }
    }
  }

  const jarChange = (j: SingleValue<JarSelectData | String>): void => {
    const jar = (j as JarSelectData).value;
    router.push(`/stats?jar=${jar}`);
    setJar(j as JarSelectData);
    // setPage("jar");
  };

  useEffect(() => {
    const getData = async () => {
      if (core) {
        const options = coreToOptions(core, chain);
        setOptions(options);
      }
    };
    getData();

    setInterval(getData, 180000); // Updates every 3 minutes seconds
  }, [core, chain]);
  if (Object.keys(chain).length > 0)
    return (
      <Select
        className="w-1/3 my-5"
        placeholder={"Filter By Jar"}
        styles={styles}
        isSearchable={true}
        onChange={(j) => jarChange(j)}
        value={Object.keys(jar).length > 0 ? jar : ""}
        options={options}
      />
    );
  return null;
};

export const coreToOptions = (
  core: PickleModelJson.PickleModelJson | undefined,
  chain?: ChainSelectData,
): JarSelectData[] => {
  const jarsOnNetwork =
    core && core.assets
      ? chain
        ? core.assets.jars.filter((jar) => jar.chain === (chain.value as ChainNetwork))
        : core.assets.jars
      : [];
  const jars = jarsOnNetwork.filter(filterJars);
  const options: JarSelectData[] = [];
  for (let i = 0; i < jars.length; i++) {
    options.push({
      value: jars[i].details && jars[i].details.apiKey ? jars[i].details.apiKey : "",
      label: jars[i].details ? `${jars[i].id} (${jars[i].details.apiKey})` : jars[i].id,
    });
  }
  return options;
};

const styles: StylesConfig<JarSelectData | String, false> = {
  clearIndicator: (styles) => ({
    ...styles,
    color: "rgb(var(--color-foreground-alt-300))",
    ":hover": {
      color: "rgb(var(--color-foreground-alt-200))",
    },
  }),
  control: (styles) => ({
    ...styles,
    backgroundColor: "rgb(var(--color-background-lightest))",
    border: 0,
    boxShadow: "none",
    padding: "8px 0",
  }),
  input: (styles) => ({
    ...styles,
    color: "rgb(var(--color-primary))",
  }),
  menu: (styles) => ({
    ...styles,
    backgroundColor: "rgb(var(--color-background-light))",
    padding: 8,
    zIndex: 55,
    boxShadow: "0 0 0 1px rgb(var(--color-background-lightest))",
  }),
  singleValue: (styles) => {
    return {
      ...styles,
      color: "rgb(var(--color-foreground-alt-200))",
    };
  },
  option: (styles, { isFocused }) => ({
    ...styles,
    backgroundColor: isFocused ? "rgb(var(--color-background-lightest))" : undefined,
    borderRadius: 10,
    transition: "all 200ms ease-in-out",
  }),
};

const filterJars = (jar: JarDefinition) => {
  if (
    jar.enablement !== AssetEnablement.PERMANENTLY_DISABLED &&
    jar.enablement !== AssetEnablement.DISABLED &&
    jar.details?.apiKey !== undefined
  )
    return jar;
};

export interface JarSelectData {
  value: string;
  label: string;
}

type SetJarFunction = (property: JarSelectData) => void;
type SetChainFunction = (property: ChainSelectData) => void;

export default JarSelect;
