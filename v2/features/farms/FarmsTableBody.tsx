import React, { FC } from "react";
import { useTranslation } from "next-i18next";

import FarmsTableRow from "./FarmsTableRow";
import { AssetWithData, CoreSelectors, JarWithData } from "v2/store/core";
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
  singleAsset?: AssetWithData;
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
  let assets = useAppSelector(
    CoreSelectors.makeAssetsSelector({ account, filtered: !simple, paginated: !simple }),
  );
  const userModelUpdatedAt = useAppSelector((state) =>
    UserSelectors.selectUpdatedAt(state, account),
  );

  const brineries = useAppSelector(CoreSelectors.makeBrinerySelector({ account }));

  // TODO Should be all assets, not just jars
  if (requiresUserModel && userModel) {
    const apiKeys = Object.entries(userModel.tokens)
      .filter(([_, data]) => hasBalances(data!))
      .map(([apiKey]) => apiKey.toUpperCase());

    assets = assets.filter((asset) => apiKeys.includes(asset.details.apiKey.toUpperCase()));
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

  if (assets.length === 0)
    return (
      <tr>
        <td
          colSpan={6}
          className="bg-background-light text-foreground-alt-200 text-center p-8 rounded-xl"
        >
          {userModelUpdatedAt ? t("v2.farms.noResults") : t("v2.farms.loadingInvestments")}
        </td>
      </tr>
    );

  if (isBrinery)
    return (
      <>
        {brineries.map((brinery) => (
          <FarmsTableRow
            key={brinery.details.apiKey}
            asset={brinery}
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
        asset={singleAsset}
        simple={simple}
        hideDescription={hideDescription}
        userDillRatio={userDillRatio}
      />
    );

  return (
    <>
      {assets.map((asset) => (
        <FarmsTableRow
          key={asset.details.apiKey}
          asset={asset}
          simple={simple}
          dashboard={dashboard}
          userDillRatio={userDillRatio}
        />
      ))}
    </>
  );
};

export default FarmsTableBody;
