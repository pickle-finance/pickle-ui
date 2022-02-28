import { FC } from "react";

import LanguageToggle from "./LanguageToggle";
import GasPriceIndicator from "./GasPriceIndicator";
import NetworkToggle from "v2/features/connection/NetworkToggle";
import WalletToggle from "v2/features/connection/WalletToggle";
import ThemeToggle from "v2/features/theme/ThemeToggle";

interface Props {
  PageTitle: FC;
}

const TopNavbar: FC<Props> = ({ PageTitle }) => (
  <div className="flex grow mb-8 sm:mb-12">
    <div className="pr-4">
      <PageTitle />
    </div>
    <div className="grow justify-end items-center hidden sm:flex h-10">
      <ThemeToggle />
      <LanguageToggle />
      <NetworkToggle />
      <GasPriceIndicator />
      <WalletToggle />
    </div>
  </div>
);

export default TopNavbar;
