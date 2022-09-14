import Image from "next/image";
import { FC } from "react";
import Select, {
  StylesConfig,
  components,
  OptionProps,
  ControlProps,
  SingleValue,
} from "react-select";
import { SearchIcon } from "@heroicons/react/solid";
import { classNames } from "v2/utils";
import { useSelector } from "react-redux";
import { CoreSelectors } from "v2/store/core";
import { Network } from "../connection/networks";
import { NextRouter, useRouter } from "next/router";

const ChainSelect: FC<{
  chain: ChainSelectData;
  setChain: SetFunction;
  setJar: SetFunction;
  setPage: SetFunction;
}> = ({ chain, setChain, setJar, setPage }) => {
  const networks = useSelector(CoreSelectors.selectNetworks);
  const options = networksToOptions(networks);
  const router: NextRouter = useRouter();

  const urlChain: string = Array.isArray(router.query.chain)
    ? router.query.chain[0]
    : router.query.chain || "";
  if (router.isReady && urlChain !== "" && Object.keys(chain).length === 0) {
    for (let n = 0; n < options.length; n++) {
      if (options[n].value === urlChain) {
        setChain(options[n]);
      }
    }
  }
  const chainChange = (c: SingleValue<ChainSelectData | String>): void => {
    const chain = (c as ChainSelectData).value;
    router.push(`/stats?chain=${chain}`);
    setChain(c);
    setPage("chain");
    // setJar({} as JarSelectData);
  };

  return (
    <Select
      className="w-1/3 my-5 z-auto"
      placeholder="Filter By Chain"
      styles={styles}
      onChange={(s) => chainChange(s)}
      value={Object.keys(chain).length > 0 ? chain : ""}
      options={options}
      components={{
        Control,
        Option,
      }}
    />
  );
};

const styles: StylesConfig<ChainSelectData, false> = {
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
    zIndex: 99,
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

const Control = ({ children, ...props }: ControlProps<ChainSelectData, false>) => (
  <components.Control {...props}>
    <SearchIcon className="w-6 h-6 text-foreground-alt-200 ml-3 mr-1" />
    {children}
  </components.Control>
);

const OptionImage: FC<ChainSelectData> = ({ imageSrc, label }) => {
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

const Option = ({ children, ...props }: OptionProps<ChainSelectData, false>) => {
  // Correctly highlight active option when navigating the menu using arrows keys
  const { isFocused } = props;

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

export const networksToOptions = (networks: Network[]): ChainSelectData[] => {
  const options: ChainSelectData[] = [];
  for (let i = 0; i < networks.length; i++) {
    options.push({
      imageSrc: `/networks/${networks[i].name.toLowerCase()}.png`,
      value: networks[i].name,
      label: networks[i].visibleName,
    });
  }
  return options;
};

export interface ChainSelectData {
  imageSrc: string;
  value: string;
  label: string;
}

type SetFunction = (property: any) => void;

export default ChainSelect;
