import { useState, VFC } from "react";
import { Trans, useTranslation } from "next-i18next";
import { InformationCircleIcon, XIcon } from "@heroicons/react/solid";

import Link from "v2/components/Link";

const V1LinkCard: VFC = () => {
  const [isCardVisible, setIsCardVisible] = useState<boolean>(true);

  if (!isCardVisible) return null;

  return (
    <div className="flex justify-between items-center bg-background-light rounded-xl border border-foreground-alt-500 shadow p-4 mb-6">
      <div className="flex items-center font-body text-foreground-alt-200 text-center font-normal text-sm leading-4">
        <InformationCircleIcon className="w-5 h-5 text-accent mr-2" />
        <Trans i18nKey="v2.dashboard.v1Link">
          You're interacting with the new Pickle Finance app. You can always access the original app
          <Link href="/v1" primary className="font-bold ml-1">
            here
          </Link>
          .
        </Trans>
      </div>
      <button
        className="cursor-pointer p-2 text-foreground-alt-200 hover:bg-background hover:text-foreground outline-none transition duration-300 ease-in-out rounded-xl"
        onClick={() => setIsCardVisible(false)}
      >
        <XIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default V1LinkCard;
