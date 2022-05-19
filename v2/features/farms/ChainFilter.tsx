import { FC } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import Tippy from "@tippyjs/react";

import { CoreSelectors } from "v2/store/core";
import { useAppDispatch } from "v2/store";
import { ControlsSelectors, FilterType, toggleFilter } from "v2/store/controls";
import { classNames } from "v2/utils";
import { anyFiltersOfTypeEnabled, isFilterEnabled } from "v2/store/controls.helpers";

const ChainFilter: FC = () => {
  const networks = useSelector(CoreSelectors.selectNetworks);
  const allFilters = useSelector(CoreSelectors.selectFilters);
  const enabledFilters = useSelector(ControlsSelectors.selectFilters);
  const dispatch = useAppDispatch();

  const anyNetworkFiltersEnabled = anyFiltersOfTypeEnabled(enabledFilters, FilterType.Network);

  return (
    <div className="flex flex-wrap justify-end space-x-2">
      {networks?.map((network) => {
        const filter = allFilters.find(
          (option) => option.value === network.name && option.type === FilterType.Network,
        )!;
        const isEnabled = isFilterEnabled(enabledFilters, filter);

        return (
          <Tippy
            key={network.name}
            duration={0}
            content={
              <div className="rounded-lg shadow-lg border border-foreground-alt-500 overflow-hidden">
                <div className="bg-background-light px-3 py-2">
                  <div className="text-foreground-alt-200 text-sm font-bold">
                    {network.visibleName}
                  </div>
                </div>
              </div>
            }
          >
            <div
              className={classNames(
                "group border border-transparent bg-background-light px-4 py-2 2xl:px-5 2xl:py-3 rounded-lg cursor-pointer hover:bg-background-lightest hover:border-primary-light hover:grayscale-0 transition duration-300 ease-in-out",
                isEnabled && "bg-background-lightest border-primary-light",
                !isEnabled && anyNetworkFiltersEnabled && "grayscale",
              )}
              onClick={() => dispatch(toggleFilter(filter))}
            >
              <div className="w-6 h-6 group-hover:scale-105 transition duration-300 ease-in-out">
                <Image
                  src={`/networks/${network.name}.png`}
                  width={200}
                  height={200}
                  layout="responsive"
                  alt={network.name}
                  title={network.name}
                  className="rounded-full"
                  priority
                />
              </div>
            </div>
          </Tippy>
        );
      })}
    </div>
  );
};

export default ChainFilter;
