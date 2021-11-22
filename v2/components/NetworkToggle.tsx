import { FC } from "react";
import Image from "next/image";
import { Popover } from "@headlessui/react";
import {
  ChevronDownIcon,
  CheckCircleIcon,
  CubeIcon,
} from "@heroicons/react/solid";
import { useTranslation } from "next-i18next";

import { classNames } from "../utils";
import SelectTransition from "./SelectTransition";

const networks = [
  {
    name: "Arbitrum",
    iconSrc: "/arbitrum.svg",
  },
  {
    name: "Ethereum",
    iconSrc: "/ethereum.svg",
  },
  {
    name: "OEC",
    iconSrc: "/oec.svg",
  },
  {
    name: "Polygon",
    iconSrc: "/matic.svg",
  },
];

const NetworkToggle: FC = () => {
  const { t } = useTranslation("common");

  return (
    <Popover className="relative mr-3">
      {({ open }) => (
        <>
          <Popover.Button className="group rounded-md inline-flex items-center text-sm text-gray-light font-bold hover:bg-black-light transition duration-300 ease-in-out focus:outline-none px-4 py-2">
            <CubeIcon
              className="text-gray-lighter mr-2 h-5 w-5 transition duration-300 ease-in-out"
              aria-hidden="true"
            />
            <span>{t("v2.nav.networkSettings")}</span>
            <ChevronDownIcon
              className={classNames(
                open ? "text-orange" : "text-gray-lighter",
                "ml-2 h-5 w-5 transition duration-300 ease-in-out",
              )}
              aria-hidden="true"
            />
          </Popover.Button>

          <SelectTransition>
            <Popover.Panel className="absolute z-0 w-full left-1/2 transform -translate-x-1/2 mt-2 px-2 sm:px-0">
              <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 border border-gray-dark overflow-hidden">
                <div className="relative grid gap-1 bg-black-light p-2">
                  {networks.map((network) => (
                    <a
                      key={network.name}
                      className="flex justify-between items-center hover:bg-black-lighter p-2 rounded-lg transition duration-300 ease-in-out"
                    >
                      <div className="flex">
                        <div className="w-5 h-5 mr-3">
                          <Image
                            src={network.iconSrc}
                            width={200}
                            height={200}
                            layout="responsive"
                            alt={t("meta.titleFull")}
                            title={t("meta.titleFull")}
                            className="rounded-full"
                            priority
                          />
                        </div>
                        <span className="text-white hover:text-green-light text-sm font-bold">
                          {network.name}
                        </span>
                      </div>
                      {network.name === "Ethereum" && (
                        <CheckCircleIcon className="text-green-light w-4 h-4" />
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
