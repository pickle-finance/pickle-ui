import { VFC } from "react";
import { Popover } from "@headlessui/react";
import useSWR from "swr";
import { useTranslation } from "next-i18next";
import Skeleton from "@material-ui/lab/Skeleton";

import GasPumpIcon from "./icons/GasPump";
import { fetcher, EthGasStationResponse } from "../utils";
import SelectTransition from "./SelectTransition";

const GasPriceIndicatorButtonLabel: VFC<{
  data: EthGasStationResponse | undefined;
}> = ({ data }) => {
  if (!data)
    return (
      <Skeleton
        width="20px"
        height="20px"
        style={{
          background: "#0f1f22",
        }}
      />
    );

  return <span className="w-7">{data.average / 10}</span>;
};

const GasPriceIndicatorOptions: VFC<{
  data: EthGasStationResponse | undefined;
}> = ({ data }) => {
  const { t } = useTranslation("common");

  if (!data) return null;

  const prices = [
    {
      name: t("v2.gasPrices.slow"),
      value: data.safeLow / 10,
    },
    {
      name: t("v2.gasPrices.standard"),
      value: data.fast / 10,
    },
    {
      name: t("v2.gasPrices.fast"),
      value: data.fastest / 10,
    },
  ];

  return (
    <>
      {prices.map((price) => (
        <div
          key={price.name}
          className="group hover:bg-background-lightest p-2 rounded-lg transition duration-300 ease-in-out"
        >
          <p className="text-sm font-bold uppercase group-hover:text-primary-light">
            {price.value} GWEI
          </p>
          <p className="text-xs italic text-foreground-alt-200">{price.name}</p>
        </div>
      ))}
    </>
  );
};

const GasPriceIndicator: VFC = () => {
  const endpoint = "https://ethgasstation.info/api/ethgasAPI.json";
  const { data } = useSWR<EthGasStationResponse>(endpoint, fetcher);

  return (
    <Popover className="relative mr-3">
      {() => (
        <>
          <Popover.Button
            disabled={!data}
            className="group rounded-xl inline-flex items-center text-sm text-foreground-alt-200 font-bold hover:bg-background-light transition duration-300 ease-in-out focus:outline-none px-4 py-2"
          >
            <GasPumpIcon className="h-5 w-5 mr-2 fill-current" />
            <GasPriceIndicatorButtonLabel data={data} />
          </Popover.Button>

          <SelectTransition>
            <Popover.Panel className="absolute z-10 left-1/2 -translate-x-1/2 mt-2 px-2 w-28 max-w-screen-sm sm:px-0">
              <div className="rounded-lg shadow-lg ring-1 ring-background ring-opacity-5 border border-foreground-alt-500 overflow-hidden text-foreground">
                <div className="relative grid gap-1 bg-background-light p-2">
                  <GasPriceIndicatorOptions data={data} />
                </div>
              </div>
            </Popover.Panel>
          </SelectTransition>
        </>
      )}
    </Popover>
  );
};

export default GasPriceIndicator;
