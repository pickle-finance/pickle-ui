import React, { FC } from "react";
import { useTranslation } from "next-i18next";
import { useSelector } from "react-redux";

import FarmsTableRow from "./FarmsTableRow";
import { CoreSelectors, JarWithData } from "v2/store/core";
import { UserSelectors } from "v2/store/user";
import { Sort } from "v2/store/controls";
import { UserTokenData } from "picklefinance-core/lib/client/UserModel";
import LoadingIndicator from "v2/components/LoadingIndicator";
import { formatEther } from "ethers/lib/utils";

const isPresent = (value: string): boolean => value !== "0";
const hasBalances = (x: UserTokenData): boolean =>
  isPresent(x.pAssetBalance) || isPresent(x.pStakedBalance) || isPresent(x.picklePending);

interface Props {
  requiresUserModel?: boolean;
  simple?: boolean;
  sort?: Sort;
  asset?: JarWithData;
  hideDescription?: boolean;
}

const FarmsTableBody: FC<Props> = ({ simple, requiresUserModel, asset, hideDescription }) => {
  const { t } = useTranslation("common");
  const core = useSelector(CoreSelectors.selectCore);
  const userModel = useSelector(UserSelectors.selectData);
  const userDillRatio =
    parseFloat(formatEther(userModel?.dill?.balance || "0")) / (core?.dill?.totalDill || 1);
  let jars = useSelector(CoreSelectors.makeJarsSelector({ filtered: !simple, paginated: !simple }));

  // TODO Should be all assets, not just jars
  if (requiresUserModel && userModel) {
    const apiKeys = Object.entries(userModel.tokens)
      .filter(([_, data]) => hasBalances(data!))
      .map(([apiKey]) => apiKey.toUpperCase());

    jars = jars.filter((jar) => apiKeys.includes(jar.details.apiKey.toUpperCase()));
  }

  const isLoading = !core || (requiresUserModel && !userModel);

  if (isLoading) {
    return (
      <tr>
        <td colSpan={6}>
          <LoadingIndicator waitForCore waitForUserModel className="py-8" />
        </td>
      </tr>
    );
  }

  if (jars.length === 0)
    return (
      <tr>
        <td
          colSpan={6}
          className="bg-background-light text-foreground-alt-200 text-center p-8 rounded-xl"
        >
          {t("v2.farms.noResults")}
        </td>
      </tr>
    );

  if (asset)
    return (
      <FarmsTableRow
        key={asset.details?.apiKey}
        jar={asset}
        simple={simple}
        hideDescription={hideDescription}
      />
    );

  return (
    <>
      {jars.map((jar) => (
        <FarmsTableRow
          key={jar.details.apiKey}
          jar={jar}
          simple={simple}
          userDillRatio={userDillRatio}
        />
      ))}
    </>
  );
};

export default FarmsTableBody;
