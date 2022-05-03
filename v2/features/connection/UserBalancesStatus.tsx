import { FC } from "react";
import { useTranslation, Trans } from "next-i18next";

import { UserSelectors } from "v2/store/user";
import TimeAgo from "v2/components/TimeAgo";
import Ping from "./Ping";
import { useAppSelector } from "v2/store";
import { useAccount } from "v2/hooks";

interface Props {
  showDetails?: boolean;
}

const UserBalancesStatus: FC<Props> = ({ showDetails }) => {
  const { t } = useTranslation("common");
  const account = useAccount();
  const updatedAt = useAppSelector((state) => UserSelectors.selectUpdatedAt(state, account));
  const isFetching = useAppSelector(UserSelectors.selectIsFetching);

  if (isFetching)
    return (
      <div className="flex items-center text-foreground-alt-300 text-xs">
        <Ping />
        <p>{t("v2.balances.fetching")}</p>
      </div>
    );

  return (
    <p className="text-foreground-alt-300 text-sm">
      {updatedAt && showDetails && (
        <Trans i18nKey="v2.balances.lastUpdated">
          Your balances updated <TimeAgo date={updatedAt} /> ago.
        </Trans>
      )}
    </p>
  );
};

export default UserBalancesStatus;
