import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import { PickleFinancePage } from "v2/types";
import { useAppSelector } from "v2/store";
import { CoreSelectors } from "v2/store/core";

import Image from "next/image";
import UserStats from "v2/features/stats/UserStats";

const Stats: PickleFinancePage = () => {
  const core = useAppSelector(CoreSelectors.selectCore);
  const [ready, setReady] = useState({ page: false});

  const props = {
    core: core,
    ready,
    setReady
  };

  return (
    <div className="block lg:flex mb-8 sm:mb-10">
      <div className="w-full mb-4">
        <UserStats {...props} />
        <Loading {...props} />
      </div>
    </div>
  );
};

const Loading: FC<{ ready: UserStatsReady;}> = ({
  ready,
}) => {
  if (ready.page === false)
    return (
      <div className="flex justify-center items-center py-8 lg:py-32">
        <div className="bg-background-light border border-foreground-alt-300 rounded-xl w-96 h-96">
          <div className="flex justify-center mt-5">
            <Image
              loading="eager"
              src="/animations/waiting.gif"
              alt="Loading..."
              width={250}
              height={250}
            />
          </div>
          <p className="text-xl text-center text-foreground-alt-200 mt-10">Loading User Data</p>
        </div>
      </div>
    );
  return null;
};

const PageTitle: FC = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <h1 className="font-title font-medium text-2xl sm:text-3xl pt-2">{"User History"}</h1>
      <h2 className="font-body font-normal text-foreground-alt-200 text-sm sm:text-base leading-4 sm:leading-6 mt-1">
        {t("Show a user's history of interactions with this protocol")}
      </h2>
      
    </>
  );
};

export interface UserStatsReady {
  page: boolean;
}

Stats.PageTitle = PageTitle;

export { getStaticProps } from "v1/util/locales";

export default Stats;
