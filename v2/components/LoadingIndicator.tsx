import { FC } from "react";
import { useSelector } from "react-redux";
import { CheckCircleIcon } from "@heroicons/react/solid";
import { useTranslation } from "next-i18next";

import { CoreSelectors } from "v2/store/core";
import { UserSelectors } from "v2/store/user";
import Ping from "v2/features/connection/Ping";

const LoadStatusIcon: FC<{ isLoading: boolean }> = ({ isLoading }) => {
  if (isLoading) return <Ping />;

  return <CheckCircleIcon className="w-4 h-4 mr-1 text-primary-light" />;
};

interface Props {
  waitForCore?: boolean;
  waitForUserModel?: boolean;
}

const LoadingIndicator: FC<Props> = ({ waitForCore, waitForUserModel }) => {
  const { t } = useTranslation("common");
  const coreLoadingState = useSelector(CoreSelectors.selectLoadingState);
  const isUserModelLoading = useSelector(UserSelectors.selectIsFetching);

  const isCoreLoading = coreLoadingState !== "fulfilled";

  return (
    <div className="bg-black-light text-center text-sm text-gray-light py-8 rounded-xl w-full">
      {waitForCore && (
        <div className="flex items-center justify-center text-gray-outline-light text-sm mb-2">
          <LoadStatusIcon isLoading={isCoreLoading} />
          <span>{t("v2.farms.loadingCoreData")}</span>
        </div>
      )}
      {waitForUserModel && (
        <div className="flex items-center justify-center text-gray-outline-light text-sm mb-2">
          <LoadStatusIcon isLoading={isUserModelLoading} />
          <span>{t("v2.farms.loadingUserModel")}</span>
        </div>
      )}
    </div>
  );
};

export default LoadingIndicator;
