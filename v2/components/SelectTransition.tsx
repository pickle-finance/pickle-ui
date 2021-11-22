import { FC, Fragment } from "react";
import { Transition } from "@headlessui/react";

const SelectTransition: FC = ({ children }) => (
  <Transition
    as={Fragment}
    enter="transition ease-out duration-200"
    enterFrom="opacity-0 -translate-y-8"
    enterTo="opacity-100 translate-y-0"
    leave="transition ease-in duration-150"
    leaveFrom="opacity-100 translate-y-0"
    leaveTo="opacity-0 -translate-y-4"
  >
    {children}
  </Transition>
);

export default SelectTransition;
