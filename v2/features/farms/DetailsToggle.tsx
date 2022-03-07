import { FC } from "react";
import { useTranslation } from "next-i18next";
import { ChevronDownIcon } from "@heroicons/react/solid";

import { classNames } from "v2/utils";

interface Props {
  open: boolean;
}

const DetailsToggle: FC<Props> = ({ open }) => {
  const { t } = useTranslation("common");

  return (
    <div className="flex group pt-2 justify-center text-foreground-alt-200 hover:text-foreground-alt-300 cursor-pointer transition duration-300 ease-in-out">
      <div className="flex justify-end items-center pr-3">
        <ChevronDownIcon
          className={classNames(
            open && "rotate-180",
            "text-foreground mr-1 h-5 w-5 group-hover:text-accent transition-colors duration-300 ease-in-out",
          )}
          aria-hidden="true"
        />
        <span>{open ? t("v2.actions.close") : t("v2.farms.seeFarmDetails")}</span>
      </div>
    </div>
  );
};

export default DetailsToggle;
