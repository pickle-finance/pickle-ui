import { FC } from "react";
import { Trans, useTranslation } from "next-i18next";

import { Connection } from "../containers/Connection";
import { MiniIcon } from "../components/TokenIcon";
import { noFarms } from "util/constants";
import { ChainNetwork } from "picklefinance-core";

export const FarmsIntro: FC = () => {
  const { chainName } = Connection.useContainer();
  const { t } = useTranslation("common");

  const isPolygon = chainName === ChainNetwork.Polygon;
  if (isPolygon)
    return (
      <p>
        <Trans i18nKey="farms.polygon.description">
          Farms allow you to earn dual PICKLE
          <MiniIcon source="/pickle.png" /> and MATIC
          <MiniIcon source="/matic.png" /> rewards by staking tokens. (Note:
          MATIC rewards end August 23)
        </Trans>
        <br />
        {t("farms.apy")}
      </p>
    );

  if (noFarms(chainName))
    return (
      <p>
        {t("farms.introOK")}
        <br />
        {t("farms.apy")}
      </p>
    );

  return (
    <p>
      <Trans i18nKey="farms.intro">
        Jars auto-invest your deposit tokens and Farms earn you{" "}
        <strong>$PICKLEs</strong>.
        <br />
        Deposit & Stake to get into both. Hover over the displayed APY to see
        where the returns are coming from.
      </Trans>
    </p>
  );
};
