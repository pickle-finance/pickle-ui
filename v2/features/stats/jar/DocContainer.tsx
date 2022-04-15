import React, { FC } from "react";
import { renderHtmlFromString } from "v2/utils";
import { AssetDocumentationResult } from "picklefinance-core/lib/docModel/DocsInterfaces";
import { useTranslation } from "next-i18next";

const DocContainer: FC<{ docs: AssetDocumentationResult }> = ({ docs }) => {
  const { description, obtain, social, risks, componentTokens } = docs;
  const { t } = useTranslation("common");

  return (
    <>
      <div className="bg-background-light rounded-xl border border-foreground-alt-500 shadow p-4 sm:p-8">
        <h2 className="font-body font-bold text-xl mb-5">Documentation</h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="mb-2">
            <h2 className="font-body font-bold text-foreground-alt-200 mb-1">
              {t("v2.farms.docs.description")}
            </h2>
            <div className="text-sm text-foreground">{renderHtmlFromString(description)}</div>
            {Object.keys(componentTokens).map((token) => (
              <>
                <h2 className="font-body font-bold text-foreground-alt-200 mb-1 mt-3">
                  {token.toUpperCase()}
                </h2>
                <p className="text-sm text-foreground">{t(componentTokens[token])}</p>
              </>
            ))}
          </div>
          <div>
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
          </div>
        </div>
      </div>
    </>
  );
};

export default DocContainer;
