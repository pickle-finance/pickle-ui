import { FC } from "react";
import { Page, Note } from "@geist-ui/react";
import { Footer } from "../features/Footer/Footer";
import { GaugeList } from "../features/Gauges/GaugeList";
import { MiniFarmList } from "../features/MiniFarms/MiniFarmList";
import { Connection } from "../containers/Connection";
import { NETWORK_NAMES } from "containers/config";
import { GetStaticPropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const Gauges: FC = () => {
  const { chainName } = Connection.useContainer();

  return (
    <>
      <Page>
        <Page.Content>
          <h1 style={{ fontSize: `2rem`, fontFamily: `Source Code Pro` }}>
            Farms
          </h1>
          {chainName === NETWORK_NAMES.POLY ? <MiniFarmList /> : <GaugeList />}
        </Page.Content>
        <Footer />
      </Page>
    </>
  );
};

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => {
  const locales = await serverSideTranslations(locale!, ["common"]);

  return {
    props: {
      ...locales,
    },
  };
};

export default Gauges;
