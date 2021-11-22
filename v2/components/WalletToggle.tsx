import { FC } from "react";
import { Popover } from "@headlessui/react";
import { SwitchHorizontalIcon, LogoutIcon } from "@heroicons/react/solid";
import { useTranslation } from "next-i18next";
import { Jazzicon } from "@ukstv/jazzicon-react";

import SelectTransition from "./SelectTransition";

const WalletToggleOptions: FC = () => {
  const { t } = useTranslation("common");

  const options = [
    {
      name: t("v2.wallet.switch"),
      icon: SwitchHorizontalIcon,
    },
    {
      name: t("v2.wallet.exit"),
      icon: LogoutIcon,
    },
  ];

  return (
    <>
      {options.map((option) => {
        const Icon = option.icon;

        return (
          <a
            key={option.name}
            href="#"
            className="flex group hover:bg-black-lighter hover:text-green-light p-2 rounded-lg transition duration-300 ease-in-out"
          >
            <Icon className="w-5 h-5 mr-3" />
            <span className="text-sm font-bold">{option.name}</span>
          </a>
        );
      })}
    </>
  );
};

const WalletToggle: FC = () => {
  return (
    <Popover className="relative">
      {() => (
        <>
          <Popover.Button className="group rounded-md inline-flex items-center text-sm text-white font-bold hover:bg-black-light transition duration-300 ease-in-out focus:outline-none px-4 py-2">
            <span className="block mr-2">0x19bd...849f</span>
            <Jazzicon
              address="0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5"
              className="w-8 h-8"
            />
          </Popover.Button>

          <SelectTransition>
            <Popover.Panel className="absolute z-0 w-full left-1/2 transform -translate-x-1/2 mt-2 px-2 sm:px-0">
              <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 border border-gray-dark overflow-hidden">
                <div className="relative grid gap-1 bg-black-light p-2">
                  <WalletToggleOptions />
                </div>
              </div>
            </Popover.Panel>
          </SelectTransition>
        </>
      )}
    </Popover>
  );
};

export default WalletToggle;
