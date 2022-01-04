import { FC } from "react";
import { Popover } from "@headlessui/react";
import { SwitchHorizontalIcon, LogoutIcon } from "@heroicons/react/solid";
import { useTranslation } from "next-i18next";
import Davatar from "@davatar/react";

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
            className="flex p-2 transition duration-300 ease-in-out rounded-lg group hover:bg-black-lighter hover:text-green-light"
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
          <Popover.Button className="group rounded-xl inline-flex items-center text-sm text-white font-bold hover:bg-black-light transition duration-300 ease-in-out focus:outline-none px-4 py-2">
            <span className="block mr-2">0x19bd...849f</span>
            <Davatar
              size={32}
              address="0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5"
              generatedAvatarType="jazzicon"
            />
          </Popover.Button>

          <SelectTransition>
            <Popover.Panel className="absolute z-10 w-full left-1/2 transform -translate-x-1/2 mt-2 px-2 sm:px-0">
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
