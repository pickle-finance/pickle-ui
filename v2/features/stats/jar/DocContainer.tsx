import React, { FC, useState } from "react";
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
            <h2 className="font-body font-bold text-foreground-alt-200 mt-3 mb-1">
              {t("v2.farms.docs.relatedTokens")}
            </h2>
            {Object.keys(componentTokens).map((token) => {
              console.log(componentTokens);
              return (
                <>
                  <h2 className="font-body text-foreground-alt-200 mb-1 mt-3">
                    {token.toUpperCase()}
                  </h2>
                  <p className="text-sm text-foreground text-justify indent-4">
                    {<TokenText text={componentTokens[token].replace(":", "-")} />}
                  </p>
                </>
              );
            })}
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

const TokenText: FC<{ text: string }> = ({ text }) => {
  let [isMore, setIsMore] = useState(false);
  const { t } = useTranslation("common");

  if (text.length > 400)
    return (
      <>
        <span className="text-sm text-foreground text-justify indent-4">
          {text.slice(0, 300).concat("... ")}
        </span>
        {isMore ? (
          <span className="text-sm text-foreground text-justify whitespace-pre-wrap">
            {text.slice(300)}
          </span>
        ) : null}
        <div>
          <a className="text-sm text-accent cursor-pointer" onClick={() => setIsMore(!isMore)}>
            {isMore ? t("v2.stats.jar.showLess") : t("v2.stats.jar.showMore")}
          </a>
        </div>
      </>
    );
  else return <p className="text-sm text-foreground text-justify indent-4">{text}</p>;
};

export default DocContainer;
