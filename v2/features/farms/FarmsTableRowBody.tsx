import { FC } from "react";
import { useTranslation } from "next-i18next";
import { JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";

import Link from "v2/components/Link";
import Button from "v2/components/Button";
import MoreInfo from "v2/components/MoreInfo";

interface Props {
  jar: JarDefinition;
}

const FarmsTableRowBody: FC<Props> = ({ jar }) => {
  const { t } = useTranslation("common");

  return (
    <td
      colSpan={6}
      className="bg-black-light rounded-b-xl p-6 border-t border-gray-dark"
    >
      <div className="block sm:flex">
        <div className="py-4 flex-shrink-0 sm:mr-6">
          <p className="font-title font-medium text-base leading-5">1.699 LP</p>
          <p className="font-normal text-xs text-gray-light mb-6">
            {t("v2.balances.balance")}
          </p>
          <Link
            href={jar.depositToken.link}
            className="font-bold"
            external
            primary
          >
            {t("v2.farms.getToken", { token: jar.depositToken.name })}
          </Link>
        </div>
        <div className="p-4 flex-grow border border-gray-dark rounded-xl mb-2 sm:mb-0 sm:mr-6">
          <p className="font-title text-gray-light font-medium text-base leading-5 mb-2">
            {t("v2.farms.depositedToken", { token: jar.depositToken.name })}
            <MoreInfo text="More info" />
          </p>
          <div className="flex items-end justify-between">
            <span className="font-title text-green font-medium text-base leading-5">
              0.00
            </span>
            <Button>{t("v2.farms.enable")}</Button>
          </div>
        </div>
        <div className="p-4 flex-grow border border-gray-dark rounded-xl mb-2 sm:mb-0 sm:mr-6">
          <p className="font-title text-gray-light font-medium text-base leading-5 mb-2">
            {t("v2.farms.stakedToken", { token: jar.depositToken.name })}
            <MoreInfo text="More info" />
          </p>
          <div className="flex items-end justify-between">
            <span className="font-title text-green font-medium text-base leading-5">
              0.00
            </span>
            <Button type="disabled">{t("v2.farms.enable")}</Button>
          </div>
        </div>
        <div className="p-4 flex-grow border border-gray-dark rounded-xl">
          <p className="font-title text-gray-light font-medium text-base leading-5 mb-2">
            {t("v2.farms.earnedToken", { token: "PICKLEs" })}
          </p>
          <div className="flex items-end justify-between">
            <span className="font-title text-green font-medium text-base leading-5">
              0.00
            </span>
            <Button type="disabled">{t("v2.farms.enable")}</Button>
          </div>
        </div>
      </div>
    </td>
  );
};

export default FarmsTableRowBody;
