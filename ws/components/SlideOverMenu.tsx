import { FC, Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon, MenuIcon } from "@heroicons/react/outline";
import { useTranslation } from "next-i18next";

import NavItem from "./NavItem";

const SlideOverMenu: FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { t } = useTranslation("common");

  return (
    <>
      {/* Mobile menu button */}
      <div className="-mr-2 flex sm:hidden">
        <div className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
          <span className="sr-only">{t("navbar.openMenu")}</span>
          <MenuIcon
            onClick={() => setIsOpen(true)}
            className="block h-6 w-6"
            aria-hidden="true"
          />
        </div>
      </div>
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          static
          className="fixed inset-0 overflow-hidden"
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
              <Dialog.Overlay className="absolute inset-0 bg-gray-light bg-opacity-75 transition-opacity" />
            </Transition.Child>
            <div className="fixed inset-y-0 right-0 flex w-4/5">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <div className="relative w-screen max-w-md">
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
                        className="rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-light"
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="sr-only">{t("navbar.close")}</span>
                        <XIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="h-full flex flex-col py-8 bg-black-light shadow-xl overflow-y-scroll">
                    <div className="relative flex-1 px-4 sm:px-6">
                      <div className="px-2 pt-2 pb-6 space-y-4">
                        <NavItem
                          href="https://forum.pickle.finance/"
                          className="px-4"
                        >
                          {t("links.forum")}
                        </NavItem>
                        <NavItem
                          href="https://docs.pickle.finance/"
                          className="px-4"
                        >
                          {t("links.docs")}
                        </NavItem>
                        <NavItem
                          href="https://github.com/pickle-finance"
                          className="px-4"
                        >
                          {t("links.github")}
                        </NavItem>
                        <NavItem
                          href="https://twitter.com/picklefinance"
                          className="px-4"
                        >
                          {t("links.twitter")}
                        </NavItem>
                        <NavItem
                          href="https://discord.com/invite/uG6WhYkM8n"
                          className="px-4"
                        >
                          {t("links.discord")}
                        </NavItem>
                      </div>
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
