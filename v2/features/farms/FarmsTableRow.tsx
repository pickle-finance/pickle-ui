import { FC, Fragment } from "react";
import { Disclosure, Transition } from "@headlessui/react";

import { classNames } from "v2/utils";
import FarmsTableSpacerRow from "./FarmsTableSpacerRow";
import FarmsTableRowHeader from "./FarmsTableRowHeader";
import FarmsTableRowBody from "./FarmsTableRowBody";
import { JarWithData } from "v2/store/core";

interface Props {
  simple?: boolean;
  jar: JarWithData;
  userDillRatio: number;
  hideDescription?: boolean;
}

const FarmsTableRow: FC<Props> = ({ jar, simple, hideDescription, userDillRatio }) => {
  if (simple)
    return (
      <>
        <tr className="group">
          <FarmsTableRowHeader
            open={false}
            simple={simple}
            jar={jar}
            userDillRatio={userDillRatio}
          />
        </tr>
        <FarmsTableSpacerRow />
      </>
    );

  return (
    <>
      <Disclosure as={Fragment}>
        {({ open }) => (
          <>
            <Disclosure.Button
              as="tr"
              // No hover state when the row is expaned.
              className={classNames(!open && "group", !simple && "cursor-pointer")}
            >
              <FarmsTableRowHeader
                open={open}
                simple={simple}
                jar={jar}
                userDillRatio={userDillRatio}
              />
            </Disclosure.Button>

            <Transition
              as={Fragment}
              enter="transition duration-100 ease-out"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition duration-100 ease-out"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Disclosure.Panel as="tr">
                <FarmsTableRowBody jar={jar} hideDescription={hideDescription} />
              </Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>
      <FarmsTableSpacerRow />
    </>
  );
};

export default FarmsTableRow;
