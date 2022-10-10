import Tippy from "@tippyjs/react";
import { useTranslation } from "next-i18next";
import { FC } from "react";
import MoreInfo from "v2/components/MoreInfo";

import { classNames } from "v2/utils";

interface Props {
  active?: boolean;
}

const FarmsBadge: FC<Props> = ({ active }) => {
  const { t } = useTranslation("common");
  return (
    <div
      className={classNames(
        active ? "bg-primary" : "bg-foreground-alt-400",
        "rounded-xl py-1 px-2",
      )}
    >
      <Tippy
        duration={0}
        content={
          <TooltipContent>
            {t(active ? "v2.farms.stakedTooltip" : "v2.farms.notStakedTooltip")}
          </TooltipContent>
        }
      >
        <span
          className={classNames(
            active ? "text-background" : "text-foreground-alt-300",
            "block font-title font-bold text-sm text-center leading-none",
            "cursor-pointer transition-colors duration-300 hover:text-accent",
          )}
        >
          {"S"}
        </span>
      </Tippy>
    </div>
  );
};

const TooltipContent: FC = ({ children }) => (
  <div className="rounded-lg shadow-lg border border-foreground-alt-500 overflow-hidden">
    <div className="bg-background-light px-3 py-2">
      <div className="text-foreground-alt-200 text-base font-normal">{children}</div>
    </div>
  </div>
);

export default FarmsBadge;
