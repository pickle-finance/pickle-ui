import { FC, Fragment } from "react";
import { Disclosure, Transition } from "@headlessui/react";

import { classNames } from "v2/utils";
import FarmsTableSpacerRow from "./FarmsTableSpacerRow";
import FarmsTableRowHeader from "./FarmsTableRowHeader";
import BrineryTableRowHeader from "../brinery/BrineryTableRowHeader";
import FarmsTableRowBody from "./FarmsTableRowBody";
import { BrineryWithData, JarWithData } from "v2/store/core";
import { isBrinery } from "v2/store/core.helpers";

interface Props {
  simple?: boolean;
  jar: JarWithData | BrineryWithData;
  dashboard?: boolean;
  userDillRatio: number;
  hideDescription?: boolean;
}

const FarmsTableRow: FC<Props> = ({ jar, simple, dashboard, hideDescription, userDillRatio }) => {
  if (isBrinery(jar))
    return (
      <>
        <tr>
          <BrineryTableRowHeader
            open={true}
            simple={simple}
            brinery={jar as BrineryWithData}
            userDillRatio={userDillRatio}
          />
        </tr>
        <FarmsTableRowBody
          jarOrBrinery={jar as BrineryWithData}
          hideDescription={hideDescription}
        />
      </>
    );
  if (simple)
    return (
      <>
        <tr className="group">
          <FarmsTableRowHeader
            open={false}
            simple={simple}
            jar={jar as JarWithData}
            dashboard={dashboard}
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
                jar={jar as JarWithData}
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
                <FarmsTableRowBody
                  jarOrBrinery={jar as JarWithData}
                  hideDescription={hideDescription}
                />
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
