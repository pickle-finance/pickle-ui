import { useTranslation } from "next-i18next";
import { PickleModelJson } from "picklefinance-core";
import { RawChain } from "picklefinance-core/lib/chain/Chains";
import { FC, useEffect, useState } from "react";
import Select, { StylesConfig, components } from "react-select";

const ChainSelect: FC<{
  core: PickleModelJson.PickleModelJson;
  selectedChain: SelectData;
  setSelectedChain: SetChainFunction;
}> = ({ core, selectedChain, setSelectedChain }) => {
  const [selectData, setSelectData] = useState<SelectData[]>([]);
  const { t } = useTranslation("common");

  const chainChange = (chain: SelectData): void => {
    setSelectedChain(chain);
  };

  useEffect(() => {
    const getData = async () => {
      if (core) {
        const chains = core.chains.map(dataToSelect);
        setSelectData(chains);
      }
    };
    getData();

    setInterval(getData, 180000); // Updates every 3 minutes seconds
  }, [core]);

  // const VALUE_PREFIX = t("v2.dill.vote.chainSelectPrefix") + ": ";

  return (
    <Select
      className="mt-5 w-1/3"
      placeholder="Select Chain"
      defaultValue={selectedChain}
      closeMenuOnSelect={true}
      styles={styles}
      isSearchable={true}
      onChange={(s) => chainChange(s as SelectData)}
      options={selectData}
    />
  );
};

const styles: StylesConfig<SelectData> = {
  control: (styles) => ({
    ...styles,
    color: "rgb(var(--color-primary))",
    backgroundColor: "rgb(var(--color-background-lightest))",
    border: 0,
    boxShadow: "none",
    padding: "8px 0",
  }),
  menu: (styles) => ({
    ...styles,
    color: "rgb(var(--color-foreground-alt-200))",
    backgroundColor: "rgb(var(--color-background-light))",
    padding: 8,
    zIndex: 55,
    boxShadow: "0 0 0 1px rgb(var(--color-background-lightest))",
  }),
  singleValue: (styles) => ({
    ...styles,
    color: "rgb(var(--color-foreground-alt-200))",
  }),
  option: (styles, { isFocused }) => ({
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

interface SelectData {
  value: string;
  label: string;
}

type SetChainFunction = (chain: SelectData) => void;

export default ChainSelect;
