import { FC } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/outline";
import { ControlsSelectors, SortDirection, SortType, setSort } from "v2/store/controls";
import { useSelector } from "react-redux";
import { useAppDispatch } from "v2/store";
import { classNames } from "v2/utils";

interface Props {
  sortType: SortType;
  label: string;
}

const flip = (value: SortDirection): SortDirection => {
  if (value === "desc") return "asc";

  return "desc";
};

const FarmsTableHeaderCellSortable: FC<Props> = ({ sortType, label }) => {
  const sortable = sortType !== SortType.None;
  const sort = useSelector(ControlsSelectors.selectSort);
  const dispatch = useAppDispatch();

  const handleClick = () => {
    if (!sortable) return;

    let newDirection: SortDirection = sort.direction;

    /**
     * Flip sort only if clicking on the same header repeatedly.
     * Otherwise assume we're changing sort column but keeping sort direction.
     */
    if (sortType === sort.type) {
      newDirection = flip(sort.direction);
    }

    dispatch(setSort({ type: sortType, direction: newDirection }));
  };

  const renderSort = () => {
    if (sortType !== sort.type) return null;

    const SortIcon = sort.direction === "asc" ? ChevronUpIcon : ChevronDownIcon;

    return (
      <SortIcon className="mb-1 w-5 h-5 text-foreground-alt-200 transition duration-300 ease-in-out inline-block" />
    );
  };

  return (
    <th
      scope="col"
      className={classNames(
        "px-4 py-1 h-8 text-left text-xs font-bold text-foreground-alt-200 tracking-normal sm:px-6",
        sortable &&
          "cursor-pointer transition duration-300 ease-in-out hover:bg-background-light rounded-t-xl",
      )}
      onClick={handleClick}
    >
      {label}
      {sortable && renderSort()}
    </th>
  );
};

export default FarmsTableHeaderCellSortable;
