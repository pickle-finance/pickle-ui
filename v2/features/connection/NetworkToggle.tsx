import { FC } from "react";
import Image from "next/image";
import { Popover } from "@headlessui/react";
import { ChevronDownIcon, CheckCircleIcon, CubeIcon } from "@heroicons/react/solid";
import { useTranslation } from "next-i18next";
import { useWeb3React } from "@web3-react/core";

import { classNames } from "v2/utils";
import SelectTransition from "v2/components/SelectTransition";
import { switchChain } from "./ConnectionStatus";
import { useSelector } from "react-redux";
import { CoreSelectors } from "v2/store/core";
import { Network } from "./networks";

interface NetworkToggleLabelProps {
  networks: Network[] | undefined;
}

const NetworkToggleLabel: FC<NetworkToggleLabelProps> = ({ networks }) => {
  const { t } = useTranslation("common");
  const { chainId } = useWeb3React();
  const activeChain = networks?.find((network) => network.chainId === chainId);

  if (activeChain)
    return (
      <div className="flex">
        <div className="w-5 h-5 mr-3">
          <Image
            src={`/networks/${activeChain.name}.png`}
            width={200}
            height={200}
            layout="responsive"
            alt={activeChain.name}
            title={activeChain.name}
            className="rounded-full"
            priority
          />
        </div>
        <span className="text-foreground-alt-200 text-sm font-bold">{activeChain.visibleName}</span>
      </div>
    );

  return (
    <>
      <CubeIcon
        className="text-foreground-alt-100 mr-2 h-5 w-5 transition duration-300 ease-in-out"
        aria-hidden="true"
      />
      <span>{t("v2.nav.networkSettings")}</span>
    </>
  );
};

const NetworkToggle: FC = () => {
  const { chainId, active, library } = useWeb3React();
  const allCore = useSelector(CoreSelectors.selectCore);
  const networks = useSelector(CoreSelectors.selectNetworks);

  if (!active) return null;

  return (
    <Popover className="relative mr-3">
      {({ open }) => (
        <>
          <Popover.Button className="group rounded-xl inline-flex items-center text-sm text-foreground-alt-200 font-bold hover:bg-background-light transition duration-300 ease-in-out focus:outline-none px-4 py-2">
            <NetworkToggleLabel networks={networks} />
            <ChevronDownIcon
              className={classNames(
                open ? "text-accent" : "text-foreground-alt-100",
                "ml-2 h-5 w-5 transition duration-300 ease-in-out",
              )}
              aria-hidden="true"
            />
          </Popover.Button>

          <SelectTransition>
            <Popover.Panel className="absolute z-200 left-1/2 -translate-x-1/2 mt-2 px-2 sm:px-0">
              <div className="rounded-lg shadow-lg ring-1 ring-background ring-opacity-5 border border-foreground-alt-500">
                <div className="relative grid gap-1 bg-background-light p-2 rounded-lg">
                  {networks?.map((network) => (
                    <Popover.Button
                      key={network.name}
                      className="flex group justify-between items-center hover:bg-background-lightest p-2 rounded-lg transition duration-300 ease-in-out"
                    >
                      <div className="flex">
                        <div className="w-5 h-5 mr-3">
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
                        <span
                          className="text-foreground group-hover:text-primary-light text-sm font-bold pr-4 whitespace-nowrap"
                          onClick={() => {
                            switchChain(library, network.chainId, allCore);
                          }}
                        >
                          {network.visibleName}
                        </span>
                      </div>
                      {network.chainId === chainId ? (
                        <CheckCircleIcon className="text-primary-light w-4 h-4" />
                      ) : (
                        <div className="w-5">&nbsp;</div>
                      )}
                    </Popover.Button>
                  ))}
                </div>
              </div>
            </Popover.Panel>
          </SelectTransition>
        </>
      )}
    </Popover>
  );
};

export default NetworkToggle;
