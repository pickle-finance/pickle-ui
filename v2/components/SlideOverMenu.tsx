import { FC, Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon, MenuIcon } from "@heroicons/react/outline";
import { useTranslation } from "next-i18next";

import NavItems from "./NavItems";

const SlideOverMenu: FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { t } = useTranslation("common");

  return (
    <>
      {/* Mobile menu button */}
      <div className="-mr-2 flex sm:hidden">
        <div className="inline-flex items-center justify-center p-2 rounded-md text-foreground-alt-200 hover:bg-background-light focus:outline-none focus:ring-2 focus:ring-inset">
          <span className="sr-only">{t("v2.nav.openMenu")}</span>
          <MenuIcon onClick={() => setIsOpen(true)} className="block h-6 w-6" aria-hidden="true" />
        </div>
      </div>
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          static
          className="fixed inset-0 overflow-hidden z-200"
          open={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <div className="absolute inset-0 overflow-hidden">
            <Transition.Child
              as={Fragment}
              enter="ease-in-out duration-500"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in-out duration-500"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="absolute inset-0 bg-foreground-alt-200 bg-opacity-75 transition-opacity" />
            </Transition.Child>
            <div className="fixed inset-y-0 right-0 flex w-4/5">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <div className="relative w-screen max-w-lg">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-0 left-0 -ml-8 pt-4 pr-2 flex sm:-ml-10 sm:pr-4">
                      <button
                        className="rounded-md text-foreground-alt-400 focus:outline-none focus:ring-2 focus:ring-accent-light"
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="sr-only">{t("v2.nav.close")}</span>
                        <XIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="h-full flex py-8 bg-background shadow-xl overflow-y-scroll">
                    <div className="flex-1 flex overflow-y-auto">
                      <NavItems onClick={() => setIsOpen(false)} />
                    </div>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default SlideOverMenu;
