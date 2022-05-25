import { Filter, FilterType } from "./controls";

export const isFilterEnabled = (enabledFilters: Filter[], filter: Filter): boolean =>
  enabledFilters.find((item) => item.type === filter.type && item.value === filter.value) !==
  undefined;

export const anyFiltersOfTypeEnabled = (enabledFilters: Filter[], type: FilterType): boolean =>
  enabledFilters.find((item) => item.type === type) !== undefined;
