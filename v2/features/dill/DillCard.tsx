import React, { FC, ReactNode } from "react";

interface Props {
  title: string;
  data: string | ReactNode;
}

const DillCard: FC<Props> = ({ title, data, children }) => (
  <aside className="border border-foreground-alt-500 grow font-title rounded-lg tracking-normal p-4">
    <h1 className="font-medium text-foreground-alt-200 text-base leading-5">{title}</h1>
    <div className="flex justify-between items-end">
      <p className="text-primary whitespace-pre font-medium text-base">{data}</p>
      {children}
    </div>
  </aside>
);

export default DillCard;
