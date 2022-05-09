import React, { FC } from "react";
import { useTranslation } from "next-i18next";

import FarmsTableRow from "./FarmsTableRow";
import { CoreSelectors, JarWithData } from "v2/store/core";
import { UserSelectors } from "v2/store/user";
import { Sort } from "v2/store/controls";
import { UserTokenData } from "picklefinance-core/lib/client/UserModel";
import LoadingIndicator from "v2/components/LoadingIndicator";
import { formatEther } from "ethers/lib/utils";
import { useAppSelector } from "v2/store";
import { useAccount } from "v2/hooks";

const isPresent = (value: string): boolean => value !== "0";
const hasBalances = (x: UserTokenData): boolean =>
  isPresent(x.pAssetBalance) || isPresent(x.pStakedBalance) || isPresent(x.picklePending);

interface Props {
  requiresUserModel?: boolean;
  simple?: boolean;
  dashboard?: boolean;
  sort?: Sort;
  singleAsset?: JarWithData;
  hideDescription?: boolean;
  isBrinery?: boolean;
}

const FarmsTableBody: FC<Props> = ({
  simple,
  requiresUserModel,
  hideDescription,
  isBrinery,
  dashboard,
  singleAsset,
}) => {
  const { t } = useTranslation("common");
  const account = useAccount();
  const core = useAppSelector(CoreSelectors.selectCore);
  const userModel = useAppSelector((state) => UserSelectors.selectData(state, account));
  const userDillRatio =
    parseFloat(formatEther(userModel?.dill?.balance || "0")) / (core?.dill?.totalDill || 1);
  let jars = useAppSelector(
    CoreSelectors.makeJarsSelector({ account, filtered: !simple, paginated: !simple }),
  );

  const brineries = useAppSelector(CoreSelectors.makeBrinerySelector({ account }));

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

  if (isBrinery)
    return (
      <>
        {brineries.map((brinery) => (
          <FarmsTableRow
            key={brinery.details.apiKey}
            jar={brinery}
            simple={simple}
            userDillRatio={userDillRatio}
          />
        ))}
      </>
    );
  if (singleAsset)
    return (
      <FarmsTableRow
        key={singleAsset.details?.apiKey}
        jar={singleAsset}
        simple={simple}
        hideDescription={hideDescription}
        userDillRatio={userDillRatio}
      />
    );

  return (
    <>
      {jars.map((jar) => (
        <FarmsTableRow
          key={jar.details.apiKey}
          jar={jar}
          simple={simple}
          dashboard={dashboard}
          userDillRatio={userDillRatio}
        />
      ))}
    </>
  );
};

export default FarmsTableBody;
