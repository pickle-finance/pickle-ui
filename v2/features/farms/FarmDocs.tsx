import { FC } from "react";
import { useTranslation } from "next-i18next";

import { JarWithData } from "v2/store/core";
import { DocsSelectors } from "v2/store/docs";
import { useAppSelector } from "v2/store";
import LoadingIndicator from "v2/components/LoadingIndicator";
import { renderHtmlFromString } from "v2/utils";

interface Props {
  jar: JarWithData;
  hideDescription?: boolean;
}

const FarmDocs: FC<Props> = ({ jar, hideDescription }) => {
  const { t } = useTranslation("common");
  const jarDocs = useAppSelector((state) => DocsSelectors.selectJarDocs(state, jar.details.apiKey));

  if (!jarDocs) return <LoadingIndicator waitForDocs className="py-8" />;

  // const { description, obtain, social, risks } = jarDocs;
  const { description } = jarDocs;

  return (
    <>
      {!hideDescription && (
        <div className="mb-2">
          <h2 className="font-body font-bold text-foreground-alt-200 mb-1">
            {t("v2.farms.docs.description")}
          </h2>
          <div className="text-sm text-foreground">{renderHtmlFromString(description)}</div>
        </div>
      )}
    </>
  );
};

export default FarmDocs;
