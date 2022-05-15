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
import { useENS } from "./hooks";
import { useAccount } from "v2/hooks";

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
            className="flex group hover:bg-background-lightest hover:text-primary-light p-2 rounded-lg transition duration-300 ease-in-out"
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
  const { library, chainId } = useWeb3React<Web3Provider>();
  const account = useAccount();
  const ens = useENS(account, library, chainId);

  if (!account) return <ConnectWalletButton />;

  return (
    <Popover className="relative shrink-0">
      {() => (
        <>
          <Popover.Button className="group rounded-xl inline-flex items-center text-sm text-foreground font-bold hover:bg-background-light transition duration-300 ease-in-out focus:outline-none px-4 py-2">
            <span className="block mr-2">{ens || shortenAddress(account)}</span>
            <Davatar
              size={32}
              address={account}
              generatedAvatarType="jazzicon"
              provider={library}
            />
          </Popover.Button>

          <SelectTransition>
            <Popover.Panel className="absolute z-200 w-full left-1/2 -translate-x-1/2 mt-2 px-2 sm:px-0">
              <div className="rounded-lg shadow-lg ring-1 ring-background ring-opacity-5 border border-foreground-alt-500 overflow-hidden">
                <div className="relative grid gap-1 bg-background-light p-2">
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
