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
import { useENS, useUDomain } from "./hooks";
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
            className="flex p-2 transition duration-300 ease-in-out rounded-lg group hover:bg-background-lightest hover:text-primary-light"
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
  const { library, chainId, connector } = useWeb3React<Web3Provider>();
  const account = useAccount();
  const ens = useENS(account, library, chainId);
  const uDomain = useUDomain(connector);

  if (!account) return <ConnectWalletButton />;

  return (
    <Popover className="relative shrink-0">
      {() => (
        <>
          <Popover.Button className="inline-flex items-center px-4 py-2 text-sm font-bold transition duration-300 ease-in-out group rounded-xl text-foreground hover:bg-background-light focus:outline-none">
            <span className="block mr-2">{uDomain || ens || shortenAddress(account)}</span>
            <Davatar
              size={32}
              address={account}
              generatedAvatarType="jazzicon"
              provider={library}
            />
          </Popover.Button>

          <SelectTransition>
            <Popover.Panel className="absolute w-full px-2 mt-2 -translate-x-1/2 z-200 left-1/2 sm:px-0">
              <div className="overflow-hidden border rounded-lg shadow-lg ring-1 ring-background ring-opacity-5 border-foreground-alt-500">
                <div className="relative grid gap-1 p-2 bg-background-light">
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
