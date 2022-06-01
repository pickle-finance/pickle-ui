import { FC, useEffect, useState } from "react";
import Select, { StylesConfig } from "react-select";
import { ChainNetwork, PickleModelJson } from "picklefinance-core";
import { AssetEnablement, JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";

export const JarSelect: FC<{
  core: PickleModelJson.PickleModelJson | undefined;
  selectedChain: ChainNetwork;
  setSelectedJar: SetJarFunction;
}> = ({ core, selectedChain, setSelectedJar }) => {
  const [selectData, setSelectData] = useState<SelectData[]>([]);

  const jarChange = (jar: SelectData): void => {
    setSelectedJar(jar.value);
  };

  useEffect(() => {
    const getData = async () => {
      const tmpSelectData = [...selectData];
      if (core) {
        const activeJars = core?.assets?.jars
          .filter((x) => x.chain !== selectedChain)
          .filter((x) => x.farm !== undefined)
          .filter((x) => x.farm?.farmAddress !== "0x0000000000000000000000000000000000000000")
          .filter((x) => x.enablement !== AssetEnablement.PERMANENTLY_DISABLED)
          .filter((x) => x.details?.apiKey !== undefined)
          .map(dataToSelect);
        for (let i = 0; i < activeJars.length; i++) tmpSelectData.push(activeJars[i]);
      }
      setSelectData(tmpSelectData);
    };
    getData();

    setInterval(getData, 180000); // Updates every 3 minutes seconds
  }, [core]);
  return (
    <Select
      className="w-1/3 mt-5 mb-5"
      placeholder={"Filter By Jar"}
      styles={styles}
      isSearchable={true}
      onChange={(s) => jarChange(s as SelectData)}
      options={selectData}
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

interface SelectData {
  value: string;
  label: string;
}

type SetJarFunction = (property: string) => void;

export default JarSelect;
