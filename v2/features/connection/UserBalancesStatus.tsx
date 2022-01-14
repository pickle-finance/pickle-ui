import { FC } from "react";
import { useSelector } from "react-redux";
import { useTranslation, Trans } from "next-i18next";

import { UserSelectors } from "v2/store/user";
import TimeAgo from "v2/components/TimeAgo";

const UserBalancesStatus: FC = () => {
  const { t } = useTranslation("common");
  const updatedAt = useSelector(UserSelectors.selectUpdatedAt);
  const isFetching = useSelector(UserSelectors.selectIsFetching);

  if (isFetching)
    return (
      <div className="flex items-center text-gray-outline-light text-sm">
        <p>{t("v2.balances.fetching")}</p>
        <div className="inline-flex relative h-3 w-3 ml-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-light opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-orange opacity-90" />
        </div>
      </div>
    );

  return (
    <p className="text-gray-outline-light text-sm">
      {updatedAt && (
        <Trans i18nKey="v2.balances.lastUpdated">
          Your balances updated <TimeAgo date={updatedAt} /> ago.
        </Trans>
      )}
    </p>
  );
};

export default UserBalancesStatus;
