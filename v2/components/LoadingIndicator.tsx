import { FC, HTMLAttributes } from "react";
import { useSelector } from "react-redux";
import { CheckCircleIcon } from "@heroicons/react/solid";
import { useTranslation } from "next-i18next";

import { CoreSelectors } from "v2/store/core";
import { UserSelectors } from "v2/store/user";
import Ping from "v2/features/connection/Ping";
import { DocsSelectors } from "v2/store/docs";
import { classNames } from "v2/utils";
import { VoteSelectors } from "v2/store/offchainVotes";

const LoadStatusIcon: FC<{ isLoading: boolean }> = ({ isLoading }) => {
  if (isLoading) return <Ping />;

  return <CheckCircleIcon className="w-4 h-4 mr-1 text-primary-light" />;
};

interface Props extends HTMLAttributes<HTMLElement> {
  waitForCore?: boolean;
  waitForUserModel?: boolean;
  waitForDocs?: boolean;
  waitForVoteData?: boolean;
  customText?: string;
}

const LoadingIndicator: FC<Props> = ({
  waitForCore,
  waitForDocs,
  waitForUserModel,
  waitForVoteData,
  customText,
  className,
}) => {
  const { t } = useTranslation("common");
  const coreLoadingState = useSelector(CoreSelectors.selectLoadingState);
  const isUserModelLoading = useSelector(UserSelectors.selectIsFetching);
  const docs = useSelector(DocsSelectors.selectDocs);
  const voteData = useSelector(VoteSelectors.selectVoteData);

  const isCoreLoading = coreLoadingState !== "fulfilled";

  return (
    <div
      className={classNames(
        "bg-background-light text-center text-sm text-foreground-alt-200 rounded-xl w-full",
        className,
      )}
    >
      {waitForCore && (
        <div className="flex items-center justify-center text-foreground-alt-300 text-sm mb-2">
          <LoadStatusIcon isLoading={isCoreLoading} />
          <span>{customText ? customText : t("v2.farms.loadingCoreData")}</span>
        </div>
      )}
      {waitForUserModel && (
        <div className="flex items-center justify-center text-foreground-alt-300 text-sm mb-2">
          <LoadStatusIcon isLoading={isUserModelLoading} />
          <span>{customText ? customText : t("v2.farms.loadingUserModel")}</span>
        </div>
      )}
      {waitForDocs && (
        <div className="flex items-center justify-center text-foreground-alt-300 text-sm mb-2">
          <LoadStatusIcon isLoading={!docs} />
          <span>{customText ? customText : t("v2.farms.loadingDocs")}</span>
        </div>
      )}
      {waitForVoteData && (
        <div className="flex items-center justify-center text-foreground-alt-300 text-sm mb-2">
          <LoadStatusIcon isLoading={!voteData} />
          <span>{customText ? customText : t("v2.farms.loadingVotes")}</span>
        </div>
      )}
    </div>
  );
};

export default LoadingIndicator;
