import { FC, ReactElement } from "react";
import { useTranslation } from "next-i18next";

import { JarWithData } from "v2/store/core";
import { DocsSelectors } from "v2/store/docs";
import { useAppSelector } from "v2/store";
import LoadingIndicator from "v2/components/LoadingIndicator";
import { renderHtmlFromString } from "v2/utils";

interface Props {
  jar: JarWithData;
}

const FarmDocs: FC<Props> = ({ jar }) => {
  const { t } = useTranslation("common");
  const jarDocs = useAppSelector((state) => DocsSelectors.selectJarDocs(state, jar.details.apiKey));

  if (!jarDocs) return <LoadingIndicator waitForDocs />;

  const { description, obtain, social, risks } = jarDocs;

  return (
    <>
      <div className="mb-2">
        <h2 className="font-body font-bold text-foreground-alt-200 mb-1">
          {t("v2.farms.docs.description")}
        </h2>
        <div className="text-sm text-foreground">{renderHtmlFromString(description)}</div>
      </div>
      <div className="mb-2">
        <h2 className="font-body font-bold text-foreground-alt-200 mb-1">
          {t("v2.farms.docs.obtain")}
        </h2>
        <ul className="text-sm text-foreground">
          {obtain.map((item, index) => (
            <li key={index}>{renderHtmlFromString(item)}</li>
          ))}
        </ul>
      </div>
      {social && (
        <div className="mb-2">
          <h2 className="font-body font-bold text-foreground-alt-200 mb-1">
            {t("v2.farms.docs.social")}
          </h2>
          <ul className="text-sm text-foreground">
            {social.map((item, index) => (
              <li key={index}>{renderHtmlFromString(item)}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="mb-2">
        <h2 className="font-body font-bold text-foreground-alt-200 mb-1">
          {t("v2.farms.docs.risks")}
        </h2>
        <ul className="text-sm text-foreground">
          {risks.map((item, index) => (
            <li key={index}>{renderHtmlFromString(item)}</li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default FarmDocs;
