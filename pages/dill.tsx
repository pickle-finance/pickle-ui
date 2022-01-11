import { FC, useState } from "react";
import { Page } from "@geist-ui/react";
import { useTranslation } from "next-i18next";

import { Footer } from "../features/Footer/Footer";
import { DillFeature } from "../features/DILL/DILL";
import { Connection } from "../containers/Connection";
import { NETWORK_NAMES } from "containers/config";
import HistoricChart from "v2/features/dill/HistoricChart";
import RevenueStats from "v2/features/dill/RevenueStats";

const Dill: FC = () => {
  const { chainName } = Connection.useContainer();
  const [isReadMore, setIsReadMore] = useState(false);
  const { t } = useTranslation("common");

  return (
    <>
      <Page>
        <Page.Content>
          <h1 style={{ fontSize: `2rem`, fontFamily: `Source Code Pro` }}>
            {t("dill.dill")}
          </h1>
          <p>
            {isReadMore
              ? t("dill.description")
              : t("dill.description").substring(0, 50)}{" "}
            <span onClick={() => setIsReadMore(!isReadMore)} className="read_more">
              {isReadMore ? "Read less" : "Read more"}
            </span>
          </p>
          {/* {chainName !== NETWORK_NAMES.ETH ? (
            t("dill.connectionPrompt")
          ) : (
            <DillFeature />
          )} */}
          <h1>Revenue share stats</h1>
          <RevenueStats />

          <br />

          <section>
            <HistoricChart />
          </section>
        </Page.Content>
        <Footer />
      </Page>
    </>
  );
};

export { getStaticProps } from "../util/locales";

export default Dill;
