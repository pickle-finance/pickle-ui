import { FC } from "react";
import { Switch } from "@headlessui/react";
import { useTranslation } from "next-i18next";
import { useSelector } from "react-redux";
import { useAppDispatch } from "v2/store";

import { ControlsSelectors, setMatchAllFilters } from "v2/store/controls";
import { classNames } from "v2/utils";
import MoreInfo from "v2/components/MoreInfo";
import OnOffToggle from "v2/components/OnOffToggle";

const MatchAllFiltersToggle: FC = () => {
  const { t } = useTranslation("common");
  const dispatch = useAppDispatch();
  const matchAllFilters = useSelector(ControlsSelectors.selectMatchAllFilters);

  return (
    <OnOffToggle
      toggleOn={matchAllFilters}
      onChange={(value: boolean) => dispatch(setMatchAllFilters(value))}
    >
      <span className="text-sm font-medium text-foreground-alt-200">
        {t("v2.farms.matchAllFilters")}
      </span>
      <MoreInfo>
        <span className="text-foreground-alt-200 text-sm">
          {matchAllFilters ? t("v2.farms.matchingAllFilters") : t("v2.farms.notMatchingAllFilters")}
        </span>
      </MoreInfo>
    </OnOffToggle>
  );
};

export default MatchAllFiltersToggle;
