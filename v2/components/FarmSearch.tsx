import React, { Dispatch, FC, SetStateAction } from "react";

interface Props {
  farmFilter: string;
  setFarmFilter: Dispatch<SetStateAction<string>>;
}

const SearchBar: FC<Props> = ({ farmFilter, setFarmFilter }) => {
  return (
    <div>
      <input
        className="bg-black-light h-10 px-5 pr-16 mr-5 mb-5 rounded-lg text-sm focus:outline-none"
        type="text"
        id="farm-search"
        placeholder="Filter Farms"
        autoFocus={true}
        value={farmFilter}
        onChange={(event) => setFarmFilter(event.target.value)}
        name="s"
      />
      {/* {console.log(filter)} */}
    </div>
  );
};

export default SearchBar;
