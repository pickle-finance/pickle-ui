import React, { FC } from "react";
import { useTranslation } from "next-i18next";
import { useSelector } from "react-redux";
import { orderBy } from "lodash";

import FarmsTableRow from "./FarmsTableRow";
import { CoreSelectors } from "v2/store/core";
import { UserSelectors } from "v2/store/user";
import { UserTokenData } from "picklefinance-core/lib/client/UserModel";
import { ControlsSelectors, Sort, SortType } from "v2/store/controls";
import { JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";
import {
  getUserAssetDataWithPrices,
  UserAssetDataWithPrices,
} from "./FarmsTableRowHeader";
import LoadingIndicator from "v2/components/LoadingIndicator";

const isPresent = (value: string): boolean => value !== "0";
const hasBalances = (x: UserTokenData): boolean =>
  isPresent(x.pAssetBalance) ||
  isPresent(x.pStakedBalance) ||
  isPresent(x.picklePending);

interface Props {
  requiresUserModel?: boolean;
  simple?: boolean;
  sort?: Sort;
}

export interface JarWithData extends JarDefinition, UserAssetDataWithPrices {
  [SortType.Earned]: number | undefined;
  [SortType.Deposited]: number | undefined;
  [SortType.Apy]: number | undefined;
  [SortType.Liquidity]: number | undefined;
}

const FarmsTableBody: FC<Props> = ({ simple, requiresUserModel }) => {
  const { t } = useTranslation("common");
  const coreLoadingState = useSelector(CoreSelectors.selectLoadingState);
  const allCore = useSelector(CoreSelectors.selectCore);
  const isUserModelLoading = useSelector(UserSelectors.selectIsFetching);
  const userModel = useSelector(UserSelectors.selectData);
  const sort = useSelector(ControlsSelectors.selectSort);

  // TODO Should be all assets, not just jars
  let jars = useSelector(CoreSelectors.selectFilteredAssets);
  if (requiresUserModel && userModel) {
    const apiKeys = userModel.tokens
      .filter(hasBalances)
      .map((asset) => asset.assetKey);
    jars = jars.filter((jar) => apiKeys.includes(jar.details.apiKey));
  }

  let jarsWithData: JarWithData[] = jars.map((jar) => {
    const data = getUserAssetDataWithPrices(jar, allCore, userModel);
    const deposited =
      data.depositTokensInJar.tokensUSD + data.depositTokensInFarm.tokensUSD;
    const earned = data.earnedPickles.tokensUSD;
    const apy = jar.aprStats?.apy;
    const liquidity = jar.details.harvestStats?.balanceUSD;
    return {
      ...jar,
      ...data,
      deposited,
      earned,
      apy,
      liquidity,
    };
  });

  if (sort && sort.type != SortType.None) {
    jarsWithData = orderBy(jarsWithData, [sort.type], [sort.direction]);
  }

  const isCoreLoading = coreLoadingState !== "fulfilled";
  const isLoading = isCoreLoading || (requiresUserModel && isUserModelLoading);

  if (isLoading) {
    return (
      <tr>
        <td colSpan={6}>
          <LoadingIndicator waitForCore waitForUserModel />
        </td>
      </tr>
    );
  }

  if (jarsWithData.length === 0)
    return (
      <tr>
        <td
          colSpan={6}
          className="bg-background-light text-gray-light text-center p-8 rounded-xl"
        >
          {t("v2.farms.noResults")}
        </td>
      </tr>
    );

  return (
    <>
      {jarsWithData.map((jar) => (
        <FarmsTableRow key={jar.details.apiKey} jar={jar} simple={simple} />
      ))}
    </>
  );
};

export default FarmsTableBody;
