import { useState, VFC } from "react";
import { useTranslation } from "next-i18next";
import { InformationCircleIcon, XIcon } from "@heroicons/react/solid";

import Link from "v2/components/Link";

const ClaimBanner: VFC = () => {
  const [isCardVisible, setIsCardVisible] = useState<boolean>(true);
  const { t } = useTranslation("common");

  if (!isCardVisible) return null;

  return (
    <div className="flex justify-center items-center bg-orange-400 bg-opacity-40 text-foreground rounded-xl border border-orange-500 shadow p-4 mb-6">
      <InformationCircleIcon className="w-5 h-5 text-orange-600 mr-2" />
      <div className="flex items-center font-body text-foreground text-center font-normal text-sm leading-4 flex-1 justify-center">
        <span>
          🚨 <strong>Important:</strong> Pickle Finance is sunsetting. PICKLE and DILL holders can
          claim USDC from the treasury.{" "}
          <Link href="/claim" primary className="font-bold mx-1">
            Claim your share now
          </Link>
          <br />
          <br /> The frontend will be unavailable in 2 months. Please{" "}
          <Link href="/farms" primary className="font-bold mx-1">
            withdraw your funds
          </Link>
        </span>
      </div>
      <button
        className="cursor-pointer p-2 text-foreground hover:bg-orange-500 hover:text-foreground-alt-100 outline-none transition duration-300 ease-in-out rounded-xl ml-4"
        onClick={() => setIsCardVisible(false)}
      >
        <XIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ClaimBanner;
