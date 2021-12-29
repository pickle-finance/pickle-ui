import { FC } from "react";
import Image from "next/image";
import { Popover } from "@headlessui/react";
import {
  ChevronDownIcon,
  CheckCircleIcon,
  CubeIcon,
} from "@heroicons/react/solid";
import { useTranslation } from "next-i18next";
import { useWeb3React } from "@web3-react/core";

import { classNames } from "../../utils";
import SelectTransition from "../../components/SelectTransition";
import arbitrum from "public/arbitrum.svg";
import aurora from "public/aurora.svg";
import ethereum from "public/ethereum.svg";
import oec from "public/oec.svg";
import matic from "public/matic.svg";
import moonriver from "public/moonriver.svg";

type Network = {
  name: string;
  icon: any;
  chainId: number;
};

const networks: Network[] = [
  {
    name: "Arbitrum",
    icon: arbitrum,
    chainId: 42161,
  },
  {
    name: "Aurora",
    icon: aurora,
    chainId: 1313161554,
  },
  {
    name: "Ethereum",
    icon: ethereum,
    chainId: 1,
  },
  {
    name: "Moonriver",
    icon: moonriver,
    chainId: 1285,
  },
  {
    name: "OEC",
    icon: oec,
    chainId: 66,
  },
  {
    name: "Polygon",
    icon: matic,
    chainId: 137,
  },
];

interface NetworkToggleLabelProps {}

const NetworkToggleLabel: FC<NetworkToggleLabelProps> = () => {
  const { t } = useTranslation("common");
  const { chainId } = useWeb3React();

  const activeChain = networks.find((network) => network.chainId === chainId);

  if (activeChain)
    return (
      <div className="flex">
        <div className="w-5 h-5 mr-3">
          <Image
            src={activeChain.icon}
            width={200}
            height={200}
            layout="responsive"
            alt={activeChain.name}
            title={activeChain.name}
            className="rounded-full"
            priority
          />
        </div>
        <span className="text-white text-sm font-bold">{activeChain.name}</span>
      </div>
    );

  return (
    <>
      <CubeIcon
        className="text-gray-lighter mr-2 h-5 w-5 transition duration-300 ease-in-out"
        aria-hidden="true"
      />
      <span>{t("v2.nav.networkSettings")}</span>
    </>
  );
};

const NetworkToggle: FC = () => {
  const { chainId } = useWeb3React();

  return (
    <Popover className="relative mr-3">
      {({ open }) => (
        <>
          <Popover.Button className="group rounded-xl inline-flex items-center text-sm text-gray-light font-bold hover:bg-black-light transition duration-300 ease-in-out focus:outline-none px-4 py-2">
            <NetworkToggleLabel />
            <ChevronDownIcon
              className={classNames(
                open ? "text-orange" : "text-gray-lighter",
                "ml-2 h-5 w-5 transition duration-300 ease-in-out",
              )}
              aria-hidden="true"
            />
          </Popover.Button>

          <SelectTransition>
            <Popover.Panel className="absolute z-10 left-1/2 transform -translate-x-1/2 mt-2 px-2 sm:px-0">
              <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 border border-gray-dark">
                <div className="relative grid gap-1 bg-black-light p-2">
                  {networks.map((network) => (
                    <a
                      key={network.name}
                      href="#"
                      className="flex group justify-between items-center hover:bg-black-lighter p-2 rounded-lg transition duration-300 ease-in-out"
                    >
                      <div className="flex">
                        <div className="w-5 h-5 mr-3">
                          <Image
                            src={network.icon}
                            width={200}
                            height={200}
                            layout="responsive"
                            alt={network.name}
                            title={network.name}
                            className="rounded-full"
                            priority
                          />
                        </div>
                        <span className="text-white group-hover:text-green-light text-sm font-bold pr-4">
                          {network.name}
                        </span>
                      </div>
                      {network.chainId === chainId ? (
                        <CheckCircleIcon className="text-green-light w-4 h-4" />
                      ) : (
                        <div className="w-5">&nbsp;</div>
                      )}
                    </a>
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
