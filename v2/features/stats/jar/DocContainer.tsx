import React, { FC, useState } from "react";
import { renderHtmlFromString } from "v2/utils";
import { AssetDocumentationResult } from "picklefinance-core/lib/docModel/DocsInterfaces";
import { TFunction, useTranslation } from "next-i18next";
import Image from "next/image";
import { classNames } from "v2/utils";

const DocContainer: FC<{ docs: AssetDocumentationResult }> = ({ docs }) => {
  const { description, obtain, social, risks } = docs;
  const { t } = useTranslation("common");
  return (
    <>
      <Description description={description} t={t} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Obtain obtain={obtain} t={t} />
        <Social social={social} t={t} />
        <Risks risks={risks} t={t} />
      </div>
    </>
  );
};

const Description: FC<{ description: string; t: TFunction }> = ({ description, t }) => (
  <div className="w-full bg-background-light rounded-xl border border-foreground-alt-500 shadow p-4 sm:p-8 mb-5">
    <h2 className="font-body font-bold text-xl text-foreground-alt-200 mb-4">
      {t("v2.farms.docs.description")}
    </h2>
    <div className="text-sm text-foreground">{renderHtmlFromString(description)}</div>
  </div>
);

const Obtain: FC<{ obtain: string[]; t: TFunction }> = ({ obtain, t }) => (
  <div className="w-full bg-background-light rounded-xl border border-foreground-alt-500 shadow p-4 sm:p-8 mb-5">
    <h2 className="font-body font-bold text-xl text-foreground-alt-200 mb-4">
      {t("v2.farms.docs.obtain")}
    </h2>
    <ul className="text-sm text-foreground">
      {obtain.map((item, index) => (
        <li key={index.toLocaleString()}>{renderHtmlFromString(item)}</li>
      ))}
    </ul>
  </div>
);

const Social: FC<{ social: string[] | undefined; t: TFunction }> = ({ social, t }) => {
  if (social)
    return (
      <div className="w-full bg-background-light rounded-xl border border-foreground-alt-500 shadow p-4 sm:p-8 mb-5">
        <h2 className="font-body font-bold text-xl text-foreground-alt-200 mb-4">
          {t("v2.farms.docs.social")}
        </h2>
        <ul className="text-sm text-foreground">
          {social.map((item, index) => (
            <li key={index}>{renderHtmlFromString(item)}</li>
          ))}
        </ul>
      </div>
    );
  return null;
};

const Risks: FC<{ risks: string[]; t: TFunction }> = ({ risks, t }) => (
  <div className="w-full bg-background-light rounded-xl border border-foreground-alt-500 shadow p-4 sm:p-8 mb-5">
    <h2 className="font-body font-bold text-xl text-foreground-alt-200 mb-4">
      {t("v2.farms.docs.risks")}
    </h2>
    <ul className="text-sm text-foreground">
      {risks.map((item, index) => (
        <li key={index}>{renderHtmlFromString(item)}</li>
      ))}
    </ul>
  </div>
);

export default DocContainer;
