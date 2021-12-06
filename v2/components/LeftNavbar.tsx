import { FC } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "next-i18next";

import NavItems from "./NavItems";
import NavItem from "./NavItem";
import PicklePriceIndicator from "./PicklePriceIndicator";

const LeftNavbar: FC = () => {
  const { t } = useTranslation("common");

  return (
    <div className="hidden sm:flex sm:flex-col sm:w-64 sm:fixed sm:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 bg-black py-8 border-r border-gray-dark">
        <div className="flex items-center justify-center h-16 flex-shrink-0 px-4 mb-12">
          <div className="w-32">
            <Link href="/v2">
              <a aria-label="Pickle Finance home">
                <Image
                  src="/pickle.svg"
                  width={158}
                  height={60}
                  layout="responsive"
                  alt={t("meta.titleFull")}
                  title={t("meta.titleFull")}
                  priority
                />
              </a>
            </Link>
          </div>
        </div>
        <div className="flex flex-col flex-grow justify-between px-10">
          <div className="flex flex-col overflow-y-auto">
            <NavItems />
          </div>
          <div className="flex flex-col overflow-y-auto">
            <PicklePriceIndicator />
            <NavItem
              href="https://etherscan.io/address/0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5"
              external
            >
              {t("v2.nav.tokenAddress")}
            </NavItem>
            <NavItem
              href="https://etherscan.io/address/0xbBCf169eE191A1Ba7371F30A1C344bFC498b29Cf"
              external
            >
              {t("v2.nav.dillAddress")}
            </NavItem>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftNavbar;
