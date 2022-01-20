import React, { FC } from "react";
import { useTranslation } from "next-i18next";
import { useSelector } from "react-redux";

import FarmsTableRow from "./FarmsTableRow";
import { CoreSelectors } from "v2/store/core";
import { UserSelectors } from "v2/store/user";
import { UserTokenData } from "picklefinance-core/lib/client/UserModel";
import Ping from "../connection/Ping";
import { CheckCircleIcon } from "@heroicons/react/solid";
import { JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";

const LoadStatusIcon: FC<{ isLoading: boolean }> = ({ isLoading }) => {
  if (isLoading) return <Ping />;

  return <CheckCircleIcon className="w-4 h-4 mr-1 text-green-light" />;
};

interface Props {
  requiresUserModel?: boolean;
  simple?: boolean;
  farmFilter?: string;
}

const FarmsTableBody: FC<Props> = ({
  simple,
  requiresUserModel,
  farmFilter,
}) => {
  const { t } = useTranslation("common");
  const coreLoadingState = useSelector(CoreSelectors.selectLoadingState);
  const isUserModelLoading = useSelector(UserSelectors.selectIsFetching);
  const userModel = useSelector(UserSelectors.selectData);

  // TODO Should be all assets, not just jars
  let jars = useSelector(CoreSelectors.selectEnabledJars);
  if (requiresUserModel && userModel) {
    const empty = (val: string) => val !== undefined && val !== "0";
    const showAsset = (x: UserTokenData): boolean =>
      !empty(x.pAssetBalance) ||
      !empty(x.pStakedBalance) ||
      !empty(x.picklePending);
    const apiKeys: string[] = userModel.tokens
      .filter((x) => showAsset(x))
      .map((x) => x.assetKey);
    jars = jars.filter((x) => apiKeys.includes(x.details.apiKey));
  }

  const isCoreLoading = coreLoadingState !== "fulfilled";
  const isLoading = isCoreLoading || (requiresUserModel && isUserModelLoading);

  if (isLoading) {
    return (
      <tr>
        <td colSpan={6}>
          <div className="bg-black-light text-center text-sm text-gray-light py-8 rounded-xl">
            <div className="flex items-center justify-center text-gray-outline-light text-sm mb-2">
              <LoadStatusIcon isLoading={isCoreLoading} />
              <span>{t("v2.farms.loadingFarms")}</span>
            </div>
            {requiresUserModel && (
              <div className="flex items-center justify-center text-gray-outline-light text-sm mb-2">
                <LoadStatusIcon isLoading={isUserModelLoading} />
                <span>{t("v2.farms.loadingUserModel")}</span>
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  }
  return (
    <>
      {jarsToShow(jars, farmFilter).map((jar) => (
        <FarmsTableRow key={jar.details.apiKey} jar={jar} simple={simple} />
      ))}
    </>
  );
};
const jarsToShow = (
  jars: JarDefinition[],
  farmFilter: string | undefined,
): JarDefinition[] => {
  return jars.filter((jar) => {
    if (farmFilter !== "" && farmFilter !== undefined) {
      return jar.farm?.farmNickname
        .toLowerCase()
        .includes(farmFilter.toLowerCase());
    } else {
      return true;
    }
  });
};

export default FarmsTableBody;
