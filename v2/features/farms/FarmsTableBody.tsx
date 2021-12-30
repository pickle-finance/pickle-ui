import { FC } from "react";
import { useTranslation } from "next-i18next";
import { useSelector } from "react-redux";

import FarmsTableRow from "./FarmsTableRow";
import { CoreSelectors } from "v2/store/core";

interface Props {
  simple?: boolean;
}

const FarmsTableBody: FC<Props> = ({ simple }) => {
  const { t } = useTranslation("common");
  const loading = useSelector(CoreSelectors.selectLoadingState);
  const jars = useSelector(CoreSelectors.selectEnabledJars);

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
