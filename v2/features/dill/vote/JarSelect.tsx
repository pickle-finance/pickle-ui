import { ChainNetwork, PickleModelJson } from "picklefinance-core";
import { AssetEnablement, JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";
import { FC, useEffect, useState } from "react";
import Select, { StylesConfig } from "react-select";

export const JarSelect: FC<{
  core: PickleModelJson.PickleModelJson;
  mainnet: boolean;
  setSelectedJars: SetJarsFunction;
}> = ({ core, mainnet, setSelectedJars }) => {
  const [activeJars, setActiveJars] = useState([] as SelectData[]);

  const jarChange = (jars: SelectData[]): void => {
    setSelectedJars(jars.map((jar: SelectData) => jar.value));
  };
  useEffect(() => {
    const getData = async () => {
      let activeJars: SelectData[] = [];
      if (core) {
        activeJars = core?.assets?.jars
          .filter((x) =>
            mainnet ? x.chain === ChainNetwork.Ethereum : x.chain !== ChainNetwork.Ethereum,
          )
          .filter((x) => x.enablement !== AssetEnablement.PERMANENTLY_DISABLED)
          .filter((x) => x.details?.apiKey !== undefined)
          .map(dataToSelect);
      }
      setActiveJars(activeJars);
    };
    getData();

    setInterval(getData, 180000); // Updates every 3 minutes seconds
  }, [core]);
  return (
    <Select
      placeholder="Select Jars"
      styles={styles}
      isMulti={true}
      isSearchable={true}
      closeMenuOnSelect={false}
      onChange={(jars) => jarChange(jars as SelectData[])}
      options={activeJars}
    />
  );
};

const dataToSelect = (data: JarDefinition): SelectData => ({
  value: data.details && data.details.apiKey ? data.details.apiKey : "",
  label: data.details ? `${data.id} (${data.details.apiKey})` : data.id,
});

const styles: StylesConfig<SelectData> = {
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
  multiValue: (styles) => {
    return {
      ...styles,
      color: "rgb(var(--color-foreground-alt-200))",
      backgroundColor: "rgb(var(--color-background))",
    };
  },
  multiValueLabel: (styles) => {
    return {
      ...styles,
      fontWeight: 700,
      color: "rgb(var(--color-foreground-alt-200))",
    };
  },
  option: (styles, { data, isFocused }) => ({
    ...styles,
    backgroundColor: isFocused ? "rgb(var(--color-background-lightest))" : undefined,
    borderRadius: 10,
    transition: "all 200ms ease-in-out",
  }),
};

interface SelectData {
  value: string;
  label: string;
}

type SetJarsFunction = (property: string[]) => void;

export default JarSelect;
