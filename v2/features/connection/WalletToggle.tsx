import { FC } from "react";
import { Popover } from "@headlessui/react";
import { LogoutIcon } from "@heroicons/react/solid";
import { useTranslation } from "next-i18next";
import Davatar from "@davatar/react";
import { useWeb3React } from "@web3-react/core";
import type { Web3Provider } from "@ethersproject/providers";

import SelectTransition from "v2/components/SelectTransition";
import ConnectWalletButton from "./ConnectWalletButton";
import { shortenAddress } from "v2/utils";
import { useAppDispatch } from "v2/store";
import { setIsManuallyDeactivated } from "v2/store/connection";

const WalletToggleOptions: FC = () => {
  const { deactivate } = useWeb3React<Web3Provider>();
  const { t } = useTranslation("common");
  const dispatch = useAppDispatch();

  const options = [
    {
      name: t("v2.wallet.exit"),
      icon: LogoutIcon,
      action: () => {
        deactivate();
        dispatch(setIsManuallyDeactivated());
      },
    },
  ];

  return (
    <>
      {options.map((option) => {
        const Icon = option.icon;

        return (
          <a
            key={option.name}
            onClick={option.action}
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
  const { account, library } = useWeb3React<Web3Provider>();

  if (!account) return <ConnectWalletButton />;

  return (
    <Popover className="relative">
      {() => (
        <>
          <Popover.Button className="group rounded-xl inline-flex items-center text-sm text-white font-bold hover:bg-black-light transition duration-300 ease-in-out focus:outline-none px-4 py-2">
            <span className="block mr-2">{shortenAddress(account)}</span>
            <Davatar
              size={32}
              address={account}
              generatedAvatarType="jazzicon"
              provider={library}
            />
          </Popover.Button>

          <SelectTransition>
            <Popover.Panel className="absolute z-10 w-full left-1/2 -translate-x-1/2 mt-2 px-2 sm:px-0">
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
