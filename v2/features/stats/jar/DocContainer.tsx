import React, { FC } from "react";
import { AssetDocs } from "./types";
import sanitizeHtml from "sanitize-html";

export const DocContainer: FC<{ docs: AssetDocs }> = ({ docs }) => {
  const createMarkup = () => {
    if (docs.description) return { __html: sanitizeHtml(docs.description) };
  };

  return (
    <div className="bg-background-light rounded-xl border border-foreground-alt-500 shadow p-4 sm:p-8">
      <h2 className="font-body font-bold text-xl">Documentation</h2>
      <br />
      <div dangerouslySetInnerHTML={createMarkup()} />
    </div>
  );
};
