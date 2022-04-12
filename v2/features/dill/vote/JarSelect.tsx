import { FC, useEffect, useState } from "react";
import Select, { StylesConfig } from "react-select";
import { ChainNetwork, PickleModelJson } from "picklefinance-core";
import { AssetEnablement, JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";

export const JarSelect: FC<{
  core: PickleModelJson.PickleModelJson;
  mainnet: boolean;
  selectedJars: string[];
  selectedJarStrats?: string[];
  setSelectedJars: SetJarsFunction;
  setSelectedJarStrats?: SetStratsFunction;
}> = ({
  core,
  mainnet,
  selectedJars,
  selectedJarStrats,
  setSelectedJars,
  setSelectedJarStrats,
}) => {
  const selected = selectedJars
    ? selectedJarStrats
      ? selectedJars.concat(selectedJarStrats)
      : selectedJars
    : selectedJarStrats
    ? selectedJarStrats
    : [];
  const [selectData, setSelectData] = useState<SelectData[]>(
    mainnet
      ? []
      : [
          {
            label: "Delegate to the Pickle Team",
            value: "strategy.delegate.team",
          },
          {
            label: "Vote By TVL",
            value: "strategy.tvl",
          },
          {
            label: "Vote By Profit",
            value: "strategy.profit",
          },
        ],
  );

  const jarChange = (jars: SelectData[]): void => {
    setSelectedJars(jars.map((jar: SelectData) => jar.value));
  };
  const stratChange = (strats: SelectData[]): void => {
    setSelectedJarStrats ? setSelectedJarStrats(strats.map((strat: SelectData) => strat.value)) : 0;
  };
  const change = (selections: SelectData[]): void => {
    const strategies = ["strategy.delegate.team", "strategy.tvl", "strategy.profit"];
    const strats = selections.filter((s) => strategies.includes(s.value));
    const jars = selections.filter((s) => !strategies.includes(s.value));
    jarChange(jars);
    stratChange(strats);
  };
  useEffect(() => {
    const getData = async () => {
      const tmpSelectData = [...selectData];
      if (core) {
        const activeJars = core?.assets?.jars
          .filter((x) =>
            mainnet ? x.chain === ChainNetwork.Ethereum : x.chain !== ChainNetwork.Ethereum,
          )
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
      placeholder={mainnet ? "Select Mainnet Jars" : "Select Sidechain Strategy and/or Jars"}
      value={selected ? selected.map((s) => stringToSelect(s, selectData)) : []}
      styles={styles}
      isMulti={true}
      isSearchable={true}
      closeMenuOnSelect={false}
      onChange={(s) => change(s as SelectData[])}
      options={selectData}
    />
  );
};

const dataToSelect = (data: JarDefinition): SelectData => ({
  value: data.details && data.details.apiKey ? data.details.apiKey : "",
  label: data.details ? `${data.id} (${data.details.apiKey})` : data.id,
});

const stringToSelect = (str: string, selectData: SelectData[]): SelectData => {
  let s = selectData.find((s) => s.value === str);
  const label = s ? s.label : "";
  return {
    value: str,
    label: label,
  };
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

interface SelectData {
  value: string;
  label: string;
}

type SetJarsFunction = (property: string[]) => void;
type SetStratsFunction = (property: string[]) => void;

export default JarSelect;
