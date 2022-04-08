import { PickleModelJson } from "picklefinance-core";
import { RawChain } from "picklefinance-core/lib/chain/Chains";
import { FC, useEffect, useState } from "react";
import Select, { StylesConfig } from "react-select";

const ChainSelect: FC<{
  core: PickleModelJson.PickleModelJson;
  selectedChains: string[];
  selectedChainStrats?: string[];
  setSelectedChains: SetChainsFunction;
  setSelectedChainStrats: SetStratsFunction;
}> = ({ core, selectedChains, selectedChainStrats, setSelectedChains, setSelectedChainStrats }) => {
  const selected = selectedChains
    ? selectedChainStrats
      ? selectedChains.concat(selectedChainStrats)
      : selectedChains
    : selectedChainStrats
    ? selectedChainStrats
    : [];

  const [selectData, setSelectData] = useState<SelectData[]>([
    {
      label: "Delegate to the Pickle Team",
      value: "strategy.chain.delegate.team",
    },
    {
      label: "Distribute Equally to Sidechains",
      value: "strategy.chain.sidechains.equal",
    },
  ]);

  const chainChange = (chains: SelectData[]): void => {
    setSelectedChains(chains.map((chain) => chain.value));
  };
  const stratChange = (strats: SelectData[]): void => {
    setSelectedChainStrats(strats.map((strat) => strat.value));
  };
  const change = (selections: SelectData[]): void => {
    const strategies = ["strategy.chain.delegate.team", "strategy.chain.sidechains.equal"];
    const strats = selections.filter((s) => strategies.includes(s.value));
    const chains = selections.filter((s) => !strategies.includes(s.value));
    chainChange(chains);
    stratChange(strats);
  };
  useEffect(() => {
    const getData = async () => {
      let tmpSelectData: SelectData[] = [...selectData];
      if (core) {
        const chains = core?.chains.map(dataToSelect);
        for (let i = 0; i < chains.length; i++) tmpSelectData.push(chains[i]);
      }
      setSelectData(tmpSelectData);
    };
    getData();

    setInterval(getData, 180000); // Updates every 3 minutes seconds
  }, [core]);
  return (
    <Select
      className="mt-5 mb-5"
      placeholder="Select Chains"
      value={selected ? selected.map((c) => stringToSelect(c, selectData)) : []}
      closeMenuOnSelect={false}
      styles={styles}
      isMulti={true}
      isSearchable={true}
      onChange={(s) => change(s as SelectData[])}
      options={selectData}
    />
  );
};

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

const dataToSelect = (chain: RawChain): SelectData => ({
  value: chain.network,
  label: chain.networkVisible,
});

const stringToSelect = (str: string, selectData: SelectData[]): SelectData => {
  let s = selectData.find((s) => s.value === str);
  const label = s ? s.label : "";
  return {
    value: str,
    label: label,
  };
};

interface SelectData {
  value: string;
  label: string;
}

type SetChainsFunction = (property: string[]) => void;
type SetStratsFunction = (property: string[]) => void;

export default ChainSelect;
