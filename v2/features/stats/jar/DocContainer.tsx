import React, { FC } from "react";
import { renderHtmlFromString } from "v2/utils";
import { AssetDocs } from "v2/types";

const DocContainer: FC<{ docs: AssetDocs }> = ({ docs }) => (
  <div className="bg-background-light rounded-xl border border-foreground-alt-500 shadow p-4 sm:p-8">
    <h2 className="font-body font-bold text-xl">Documentation</h2>
    <br />
    <p className="text-sm">{renderHtmlFromString(docs.description)}</p>
  </div>
);

export default DocContainer;
