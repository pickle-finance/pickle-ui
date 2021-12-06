import { FC, Fragment } from "react";
import { Disclosure } from "@headlessui/react";

import { classNames } from "v2/utils";
import { Farm } from "v2/types";
import FarmsTableSpacerRow from "./FarmsTableSpacerRow";
import FarmsTableRowHeader from "./FarmsTableRowHeader";
import FarmsTableRowBody from "./FarmsTableRowBody";

interface Props {
  simple?: boolean;
  farm: Farm;
}

const FarmsTableRow: FC<Props> = ({ farm, simple }) => {
  return (
    <>
      <Disclosure as={Fragment}>
        {({ open }) => (
          <>
            <Disclosure.Button
              as="tr"
              // No hover state when the row is expaned.
              className={classNames(
                !open && "group",
                !simple && "cursor-pointer",
              )}
            >
              <FarmsTableRowHeader open={open} simple={simple} farm={farm} />
            </Disclosure.Button>
            <Disclosure.Panel as="tr">
              <FarmsTableRowBody farm={farm} />
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      <FarmsTableSpacerRow />
    </>
  );
};

export default FarmsTableRow;
