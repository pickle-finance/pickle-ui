import { FC } from "react";

import { classNames } from "v2/utils";

interface Props {
  active?: boolean;
}

const RevenueStats: FC<Props> = ({ active }) => {
  const items = [
    { value: "$7,381,226", title: "Total locked" },
    { value: "$121,121.94", title: "Weekly reward" },
    { value: "101.78%", title: "Current APY" },
    { value: "Thu, Jun 10 2021", title: "Next distribution" },
  ];

  return (
    <div
      className={classNames(
        active ? "bg-green" : "bg-gray-outline",
        "rounded-xl py-5 px-5 flex justify-between align-center",
      )}
    >
      {items?.map((item, i) => (
        <aside key={i}>
          <p className="dill__value">{item.value}</p>
          <p className="dill__title">{item.title}</p>
        </aside>
      ))}
    </div>
  );
};

export default RevenueStats;
