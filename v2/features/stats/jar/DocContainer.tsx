import React, { FC, useState } from "react";
import { renderHtmlFromString } from "v2/utils";
import { AssetDocumentationResult } from "picklefinance-core/lib/docModel/DocsInterfaces";
import { TFunction, useTranslation } from "next-i18next";
import Image from "next/image";
import { classNames } from "v2/utils";

const DocContainer: FC<{ docs: AssetDocumentationResult }> = ({ docs }) => {
  const { description, obtain, social, risks, componentTokens } = docs;
  const { t } = useTranslation("common");
  return (
    <>
      <Description description={description} t={t} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Obtain obtain={obtain} t={t} />
        <Social social={social} t={t} />
        <Risks risks={risks} t={t} />
      </div>
      <RelatedTokens componentTokens={componentTokens} t={t} />
    </>
  );
};

const TokenText: FC<{ text: string }> = ({ text }) => {
  let [isMore, setIsMore] = useState(false);
  const { t } = useTranslation("common");

  if (text.length > 600)
    return (
      <>
        <span className="text-sm text-foreground text-justify indent-4">
          {text.slice(0, 400).concat(isMore ? "" : "... ")}
        </span>
        {isMore ? (
          <span className="text-sm text-foreground text-justify whitespace-pre-wrap">
            {text.slice(300)}
          </span>
        ) : null}
        <div className="mt-4">
          <a className="text-sm text-accent cursor-pointer" onClick={() => setIsMore(!isMore)}>
            {isMore ? t("v2.stats.jar.showLess") : t("v2.stats.jar.showMore")}
          </a>
        </div>
      </>
    );
  else return <p className="text-sm text-foreground text-justify indent-4">{text}</p>;
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

const RelatedTokens: FC<{ componentTokens: { [key: string]: string }; t: TFunction }> = ({
  componentTokens,
  t,
}) => {
  const [chosenToken, setChosenToken] = useState(
    Object.keys(componentTokens).length > 0 ? Object.keys(componentTokens)[0] : "",
  );
  return (
    <>
      <h2 className="font-body font-bold text-xl text-foreground-alt-200 mt-3 mb-5">
        {t("v2.farms.docs.relatedTokens")}
      </h2>
      <div className="w-min bg-background-light mb-5 rounded-xl">
        <table className="table-auto">
          <tbody>
            <tr>
              {Object.keys(componentTokens).map((token) => (
                <td
                  className="p-2 cursor-pointer"
                  key={token}
                  onClick={() => setChosenToken(token)}
                >
                  <div
                    className={classNames(
                      "flex mx-auto rounded-xl py-2 px-4 hover:text-accent",
                      chosenToken === token ? "bg-foreground-alt-500" : undefined,
                    )}
                  >
                    <div className="mr-3 w-12 h-12 rounded-full border-3 border-foreground-alt-400">
                      <Image
                        src={`/tokens/${token}.png`}
                        className="rounded-full"
                        width={48}
                        height={48}
                        layout="intrinsic"
                        alt={token}
                        title={token}
                      />
                    </div>
                    <p
                      className={classNames(
                        "text-xl text-foreground-alt-200 font-bold mt-3",
                        chosenToken === token ? "text-accent" : undefined,
                      )}
                    >
                      {token.toUpperCase()}
                    </p>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      {componentTokens[chosenToken] && (
        <div className="bg-background-light rounded-xl border border-foreground-alt-500 shadow p-4 sm:p-8 mb-5">
          <h2 className="font-body text-xl text-foreground-alt-200 mb-4">
            {chosenToken.toUpperCase()}
          </h2>
          <div className="text-sm text-foreground text-justify indent-4">
            {<TokenText text={componentTokens[chosenToken].replace(":", "-")} />}
          </div>
        </div>
      )}
    </>
  );
};

export default DocContainer;
