import { FC } from "react";

import LanguageToggle from "./LanguageToggle";
import GasPriceIndicator from "./GasPriceIndicator";
import NetworkToggle from "v2/features/connection/NetworkToggle";
import WalletToggle from "v2/features/connection/WalletToggle";

interface Props {
  PageTitle: FC;
}

const TopNavbar: FC<Props> = ({ PageTitle }) => (
  <div className="flex flex-grow mb-8 sm:mb-12">
    <div className="pr-4">
      <PageTitle />
    </div>
    <div className="flex-grow justify-end items-center hidden sm:flex h-10">
      <LanguageToggle />
      <NetworkToggle />
      <GasPriceIndicator />
      <WalletToggle />
    </div>
  </div>
);

export default TopNavbar;
