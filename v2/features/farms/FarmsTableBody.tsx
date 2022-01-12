import { FC } from "react";
import { useTranslation } from "next-i18next";
import { useSelector } from "react-redux";

import FarmsTableRow from "./FarmsTableRow";
import { CoreSelectors } from "v2/store/core";
import { UserSelectors } from "v2/store/user";
import { UserData, UserTokenData } from "picklefinance-core/lib/client/UserModel";

interface Props {
  simple?: boolean;
  dashboard?: boolean;
}

const FarmsTableBody: FC<Props> = ({ simple, dashboard }) => {
  const { t } = useTranslation("common");
  const loading = useSelector(CoreSelectors.selectLoadingState);
  const userModel: UserData | undefined = useSelector(UserSelectors.selectData);

  // TODO Should be all assets, not just jars
  let jars = useSelector(CoreSelectors.selectEnabledJars);
  if( dashboard && userModel) {
    const empty = (val:string) => val !== undefined && val !== "0";
    const showAsset = (x:UserTokenData):boolean => !empty(x.pAssetBalance) || !empty(x.pStakedBalance) || !empty(x.picklePending);
    const apiKeys:string[] = userModel.tokens.filter((x)=> showAsset(x)).map((x)=>x.assetKey);
    jars = jars.filter((x) => apiKeys.includes(x.details.apiKey));
  }

  if (loading !== "fulfilled") {
    return (
      <tr>
        <td colSpan={6} className="bg-black">
          <p className="text-center text-sm text-gray-light py-10">
            {t("v2.farms.loading")}
          </p>
        </td>
      </tr>
    );
  }

  return (
    <>
      {jars.map((jar) => (
        <FarmsTableRow key={jar.details.apiKey} jar={jar} simple={simple} />
      ))}
    </>
  );
};

export default FarmsTableBody;
