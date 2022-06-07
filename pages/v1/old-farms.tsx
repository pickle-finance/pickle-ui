import { FC } from "react";
import { Page, Note, Spacer } from "@geist-ui/react";
import { ArrowLeft } from "@geist-ui/react-icons";
import { Trans, useTranslation } from "next-i18next";
import Link from "next/link";

import { Footer } from "v1/features/Footer/Footer";
import { FarmList } from "v1/features/Farms/FarmList";

const Farms: FC = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <Page>
        <Page.Content>
          <Link href="/farms" passHref>
            <a style={{ textDecoration: "none" }}>
              <strong>
                <ArrowLeft size={13} /> {t("oldFarms.back")}
              </strong>
            </a>
          </Link>
          <Spacer />
          <Note type="warning" style={{ textAlign: "center" }}>
            <Trans i18nKey="oldFarms.disclaimer">
              These Farms stopped earning $PICKLEs on Thu, Apr 22, 2021 (12 AM GMT)
              <br />
              To earn $PICKLEs, migrate any tokens here to the new Farms
              <br />
              Expand on any Farm you have tokens, and click
              <strong>Migrate</strong>
            </Trans>
          </Note>

          <h1 style={{ fontSize: `2rem`, fontFamily: `Source Code Pro` }}>{t("info.farms")}</h1>
          <FarmList />
        </Page.Content>
        <Footer />
      </Page>
    </>
  );
};

export { getStaticProps } from "v1/util/locales";

export default Farms;
