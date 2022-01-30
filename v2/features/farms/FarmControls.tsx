import { FC } from "react";

import FarmSearch from "./FarmSearch";
import MatchAllFiltersToggle from "./MatchAllFiltersToggle";

const FarmControls: FC = () => {
  return (
    <div className="mb-4 block sm:flex items-end">
      <div className="w-1/2 sm:w-2/5 mb-2 sm:mb-0 sm:mr-3">
        <FarmSearch />
      </div>
      <MatchAllFiltersToggle />
    </div>
  );
};

export default FarmControls;
