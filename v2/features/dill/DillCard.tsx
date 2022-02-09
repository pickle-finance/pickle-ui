import React, { FC, ReactNode } from "react";

interface Props {
  title: string;
  data: string | ReactNode;
}

const DillCard: FC<Props> = ({ title, data, children }) => (
  <aside className="border border-gray-dark grow font-title rounded-lg tracking-normal p-4 mr-0 sm:mr-6 mb-4 last:mr-0">
    <h1 className="font-medium text-gray-light text-base leading-5">{title}</h1>
    <div className="flex justify-between items-end">
      <p className="text-green whitespace-pre font-medium text-base">{data}</p>
      {children}
    </div>
  </aside>
);

export default DillCard;
