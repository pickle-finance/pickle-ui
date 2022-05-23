import { FC } from "react";
import ChainFilter from "./ChainFilter";

import FarmSearch from "./FarmSearch";
import MatchAllFiltersToggle from "./MatchAllFiltersToggle";
import Pagination from "./Pagination";

const FarmControls: FC = () => {
  return (
    <>
      <div className="block xl:flex justify-between">
        <div className="flex-1 mb-2 xl:mb-0 xl:mr-4">
          <FarmSearch />
        </div>
        <div className="flex items-end">
          <ChainFilter />
        </div>
      </div>
      <div className="flex grow justify-between my-4">
        <MatchAllFiltersToggle />
        <Pagination />
      </div>
    </>
  );
};

export default FarmControls;
