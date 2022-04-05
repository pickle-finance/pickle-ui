import { PickleModelJson } from "picklefinance-core";
import { RawChain } from "picklefinance-core/lib/chain/Chains";
import { FC, useEffect, useState } from "react";
import Select, { StylesConfig } from "react-select";

interface SelectData {
  value: string;
  label: string;
}

const dataToSelect = (chain: RawChain): SelectData => ({
  value: chain.network,
  label: chain.networkVisible,
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

type SetChainsFunction = (property: string[]) => void;

const ChainSelect: FC<{
  core: PickleModelJson.PickleModelJson;
  selectedChains: string[];
  setSelectedChains: SetChainsFunction;
}> = ({ core, selectedChains, setSelectedChains }) => {
  const [chains, setChains] = useState<SelectData[]>([]);

  const chainChange = (chains: SelectData[]): void => {
    setSelectedChains(chains.map((chain) => chain.value));
  };
  useEffect(() => {
    const getData = async () => {
      let chains: SelectData[] = [];
      if (core) {
        chains = core?.chains.map(dataToSelect);
      }
      setChains(chains);
    };
    getData();

    setInterval(getData, 180000); // Updates every 3 minutes seconds
  }, [core]);
  return (
    <Select
      className="mt-5 mb-5"
      placeholder="Select Chains"
      value={selectedChains.map((c) => stringToSelect(c, chains))}
      closeMenuOnSelect={false}
      styles={styles}
      isMulti={true}
      isSearchable={true}
      onChange={(chains) => chainChange(chains as SelectData[])}
      options={chains}
    />
  );
};

const stringToSelect = (str: string, selectData: SelectData[]): SelectData => {
  let s = selectData.find((s) => s.value === str);
  const label = s ? s.label : "";
  return {
    value: str,
    label: label,
  };
};

export default ChainSelect;
