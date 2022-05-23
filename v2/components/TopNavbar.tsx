import { FC } from "react";

import LanguageToggle from "./LanguageToggle";
import GasPriceIndicator from "./GasPriceIndicator";
import NetworkToggle from "v2/features/connection/NetworkToggle";
import WalletToggle from "v2/features/connection/WalletToggle";
import ThemeToggle from "v2/features/theme/ThemeToggle";
import ConnectWalletModal from "v2/features/connection/ConnectWalletModal";

interface Props {
  PageTitle: FC;
}

const TopNavbar: FC<Props> = ({ PageTitle }) => (
  <div className="flex grow mb-8 sm:mb-12">
    <div className="flex-initial sm:pr-4">
      <PageTitle />
    </div>
    <div className="flex-none grow justify-end items-center hidden sm:flex h-10">
      <ThemeToggle />
      <LanguageToggle />
      <NetworkToggle />
      <GasPriceIndicator />
      <WalletToggle />
      <ConnectWalletModal />
    </div>
  </div>
);

export default TopNavbar;
