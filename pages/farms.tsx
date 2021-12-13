import { FC } from "react";
import { Page } from "@geist-ui/react";
import { useTranslation } from "next-i18next";

import { Footer } from "../features/Footer/Footer";
import { GaugeList } from "../features/Gauges/GaugeList";
import { MiniFarmList } from "../features/MiniFarms/MiniFarmList";
import { Connection } from "../containers/Connection";
import { NETWORK_NAMES } from "containers/config";
import { noFarms } from "util/constants";

const Gauges: FC = () => {
  const { chainName } = Connection.useContainer();
  const { t } = useTranslation("common");
  const noFarm = noFarms(chainName)

  return (
    <Page>
      <Page.Content>
        <h1 style={{ fontSize: `2rem`, fontFamily: `Source Code Pro` }}>
          {noFarm ? t("info.jars") : t("info.farms")}
        </h1>
        {chainName === NETWORK_NAMES.ETH ? <GaugeList /> : <MiniFarmList />}
      </Page.Content>
      <Footer />
    </Page>
  );
};

export { getStaticProps } from "../util/locales";

export default Gauges;
