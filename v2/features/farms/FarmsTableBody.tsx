import React, { FC } from "react";
import { useTranslation } from "next-i18next";
import { useSelector } from "react-redux";

import FarmsTableRow from "./FarmsTableRow";
import { CoreSelectors } from "v2/store/core";
import { UserSelectors } from "v2/store/user";
import { Sort } from "v2/store/controls";
import { UserTokenData } from "picklefinance-core/lib/client/UserModel";
import LoadingIndicator from "v2/components/LoadingIndicator";

const isPresent = (value: string): boolean => value !== "0";
const hasBalances = (x: UserTokenData): boolean =>
  isPresent(x.pAssetBalance) || isPresent(x.pStakedBalance) || isPresent(x.picklePending);

interface Props {
  requiresUserModel?: boolean;
  simple?: boolean;
  sort?: Sort;
}

const FarmsTableBody: FC<Props> = ({ simple, requiresUserModel }) => {
  const { t } = useTranslation("common");
  const core = useSelector(CoreSelectors.selectCore);
  const userModel = useSelector(UserSelectors.selectData);
  let jars = useSelector(CoreSelectors.makeJarsSelector({ filtered: !simple, paginated: !simple }));

  // TODO Should be all assets, not just jars
  if (requiresUserModel && userModel) {
    const apiKeys = Object.entries(userModel.tokens)
      .filter(([_, data]) => hasBalances(data!))
      .map(([apiKey]) => apiKey.toUpperCase());
    jars = jars.filter((jar) => apiKeys.includes(jar.details.apiKey));
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

  return (
    <>
      {jars.map((jar) => (
        <FarmsTableRow key={jar.details.apiKey} jar={jar} simple={simple} />
      ))}
    </>
  );
};

export default FarmsTableBody;
