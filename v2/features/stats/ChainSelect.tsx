import Image from "next/image";
import { PickleModelJson } from "picklefinance-core";
import { RawChain } from "picklefinance-core/lib/chain/Chains";
import { FC, useEffect, useState } from "react";
import Select, {
  StylesConfig,
  components,
  SingleValueProps,
  OptionProps,
  ControlProps,
} from "react-select";
import { SearchIcon } from "@heroicons/react/solid";
import { classNames } from "v2/utils";
import { useTranslation } from "next-i18next";

const ChainSelect: FC<{
  core: PickleModelJson.PickleModelJson | undefined;
  setSelectedChain: SetChainFunction;
}> = ({ core, setSelectedChain }) => {
  const [selectData, setSelectData] = useState<SelectData[]>([
    { imageSrc: "/public/pickle.svg", label: "Pickle", value: "pickle" },
  ]);

  const chainChange = (chain: SelectData): void => {
    setSelectedChain(chain.value);
  };

  useEffect(() => {
    const getData = async () => {
      let tmpSelectData: SelectData[] = [...selectData];
      if (core) {
        const chains = core?.chains.map(dataToSelect);
        for (let i = 0; i < chains.length; i++) tmpSelectData.push(chains[i]);
      }
      setSelectData(tmpSelectData);
      // console.log(tmpSelectData);
    };
    getData();

    setInterval(getData, 180000); // Updates every 3 minutes seconds
  }, [core]);
  return (
    <Select
      className="w-1/3 mt-5 mb-5"
      placeholder="Filter By Chain"
      styles={styles}
      isSearchable={true}
      onChange={(s) => chainChange(s as SelectData)}
      options={selectData}
      components={{
        Control,
        Option,
      }}
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

const Control = ({ children, ...props }: ControlProps<SelectData, true>) => (
  <components.Control {...props}>
    <SearchIcon className="w-6 h-6 text-foreground-alt-200 ml-3 mr-1" />
    {children}
  </components.Control>
);

const OptionImage: FC<SelectData> = ({ imageSrc, label }) => {
  return (
    <div className="mr-3 w-8 h-8 rounded-full border-3 border-foreground-alt-400">
      <Image
        src={imageSrc}
        className="rounded-full"
        width={32}
        height={32}
        layout="intrinsic"
        alt={label}
        title={label}
      />
    </div>
  );
};

const Option = ({ children, ...props }: OptionProps<SelectData, true>) => {
  const { t } = useTranslation("common");
  // Correctly highlight active option when navigating the menu using arrows keys
  const { isFocused } = props;
  // const { type } = props.data;

  return (
    <components.Option {...props} className="group">
      <div className="flex items-center">
        <OptionImage {...props.data} />
        <div>
          <p
            className={classNames(
              "text-foreground font-title text-base group-hover:text-primary-light transition duration-200 ease-in-out",
              isFocused && "text-primary-light",
            )}
          >
            {children}
          </p>
        </div>
      </div>
    </components.Option>
  );
};

const dataToSelect = (chain: RawChain): SelectData => ({
  imageSrc: `/networks/${chain.network.toLowerCase()}.svg`,
  value: chain.network,
  label: chain.networkVisible,
});

interface SelectData {
  imageSrc: string;
  value: string;
  label: string;
}

type SetChainFunction = (property: string) => void;

export default ChainSelect;
