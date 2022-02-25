import { FC } from "react";

import { classNames } from "v2/utils";

interface Props {
  active?: boolean;
}

const FarmsBadge: FC<Props> = ({ active }) => {
  return (
    <div
      className={classNames(
        active ? "bg-primary" : "bg-foreground-alt-400",
        "rounded-xl py-1 px-2",
      )}
    >
      <span
        className={classNames(
          active ? "text-background" : "text-foreground-alt-300",
          "block font-title font-bold text-sm text-center leading-none",
        )}
      >
        S
      </span>
    </div>
  );
};

export default FarmsBadge;
