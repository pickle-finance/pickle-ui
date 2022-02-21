import { FC } from "react";
import { Switch } from "@headlessui/react";
import { useTranslation } from "next-i18next";
import { useSelector } from "react-redux";
import { useAppDispatch } from "v2/store";

import { ControlsSelectors, setMatchAllFilters } from "v2/store/controls";
import { classNames } from "v2/utils";
import MoreInfo from "v2/components/MoreInfo";

const MatchAllFiltersToggle: FC = () => {
  const { t } = useTranslation("common");
  const dispatch = useAppDispatch();
  const matchAllFilters = useSelector(ControlsSelectors.selectMatchAllFilters);

  return (
    <Switch.Group as="div" className="flex items-center">
      <Switch
        checked={matchAllFilters}
        onChange={(value) => dispatch(setMatchAllFilters(value))}
        className={classNames(
          matchAllFilters ? "bg-primary" : "bg-foreground-alt-400",
          "relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-2000",
        )}
      >
        <span
          aria-hidden="true"
          className={classNames(
            matchAllFilters ? "translate-x-5" : "translate-x-0",
            "pointer-events-none inline-block h-5 w-5 rounded-full bg-foreground-button transform ring-0 transition ease-in-out duration-200",
          )}
        >
          <span
            className={classNames(
              matchAllFilters
                ? "opacity-0 ease-out duration-100"
                : "opacity-100 ease-in duration-200",
              "absolute inset-0 h-full w-full flex items-center justify-center transition-opacity",
            )}
            aria-hidden="true"
          >
            <svg
              className="h-3 w-3 text-foreground-alt-300"
              fill="none"
              viewBox="0 0 12 12"
            >
              <path
                d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span
            className={classNames(
              matchAllFilters
                ? "opacity-100 ease-in duration-200"
                : "opacity-0 ease-out duration-100",
              "absolute inset-0 h-full w-full flex items-center justify-center transition-opacity",
            )}
            aria-hidden="true"
          >
            <svg
              className="h-3 w-3 text-accent"
              fill="currentColor"
              viewBox="0 0 12 12"
            >
              <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
            </svg>
          </span>
        </span>
      </Switch>
      <Switch.Label as="span" className="ml-3">
        <span className="text-sm font-medium text-foreground-alt-200">
          {t("v2.farms.matchAllFilters")}
        </span>
        <MoreInfo
          secondaryText={
            matchAllFilters
              ? t("v2.farms.matchingAllFilters")
              : t("v2.farms.notMatchingAllFilters")
          }
        />
      </Switch.Label>
    </Switch.Group>
  );
};

export default MatchAllFiltersToggle;
