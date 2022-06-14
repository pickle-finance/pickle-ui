import { FC, useEffect, useState } from "react";
import Select, { StylesConfig } from "react-select";
import { ChainNetwork, PickleModelJson } from "picklefinance-core";
import { AssetEnablement, JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";
import { ChainSelectData } from "./ChainSelect";

export const JarSelect: FC<{
  core: PickleModelJson.PickleModelJson | undefined;
  chain: ChainSelectData;
  jar: JarSelectData;
  setJar: SetJarFunction;
}> = ({ core, chain, jar, setJar }) => {
  const [options, setOptions] = useState<JarSelectData[]>([]);

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
        onChange={(s) => setJar(s as JarSelectData)}
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
  if (jar.enablement !== AssetEnablement.PERMANENTLY_DISABLED && jar.details?.apiKey !== undefined)
    return jar;
};

export interface JarSelectData {
  value: string;
  label: string;
}

type SetJarFunction = (property: JarSelectData) => void;

export default JarSelect;
