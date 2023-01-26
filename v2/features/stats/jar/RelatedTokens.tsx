import { TFunction, useTranslation } from "next-i18next";
import Image from "next/image";
import { FC, useState } from "react";
import { classNames } from "v2/utils";

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

const TokenText: FC<{ text: string }> = ({ text }) => {
  let [isMore, setIsMore] = useState(false);
  const { t } = useTranslation("common");

  if (text.length > 600)
    return (
      <>
        {isMore ? (
          <span className="text-sm text-foreground text-justify whitespace-pre-wrap">{text}</span>
        ) : (
          <span className="text-sm text-foreground text-justify indent-4">
            {text.slice(0, 400).concat("...")}
          </span>
        )}
        <div className="mt-4">
          <a className="text-sm text-accent cursor-pointer" onClick={() => setIsMore(!isMore)}>
            {isMore ? t("v2.stats.jar.showLess") : t("v2.stats.jar.showMore")}
          </a>
        </div>
      </>
    );
  else return <p className="text-sm text-foreground text-justify indent-4">{text}</p>;
};

export default RelatedTokens;
