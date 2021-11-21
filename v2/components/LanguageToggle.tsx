import { FC, Fragment } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon, CheckCircleIcon } from "@heroicons/react/solid";

import { classNames } from "../utils";

const languages = [
  {
    name: "English",
    locale: "en",
  },
  {
    name: "简体中文",
    locale: "zh-Hans",
  },
  {
    name: "繁體中文",
    locale: "zh-Hant",
  },
];

const languageNameFromLocale = (locale: string | undefined): string => {
  switch (locale) {
    case "zh":
    case "zh-CN":
    case "zh-Hans":
    case "zh-SG":
      return "简体中文";
    case "zh-Hant":
    case "zh-TW":
    case "zh-HK":
      return "繁體中文";
    default:
      return "English";
  }
};

export const LanguageToggle: FC = () => {
  const { locale } = useRouter();

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button className="group rounded-md inline-flex items-center text-sm text-gray-light font-bold hover:bg-black-light transition duration-300 ease-in-out focus:outline-none px-4 py-2">
            <span>{languageNameFromLocale(locale)}</span>
            <ChevronDownIcon
              className={classNames(
                open ? "text-orange" : "text-gray-lighter",
                "ml-2 h-5 w-5 transition duration-300 ease-in-out",
              )}
              aria-hidden="true"
            />
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 -translate-y-8"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-4"
          >
            <Popover.Panel className="absolute z-0 left-1/2 transform -translate-x-1/2 mt-2 px-2 w-36 max-w-screen-sm sm:px-0">
              <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 border border-gray-dark overflow-hidden">
                <div className="relative grid gap-1 bg-black-light p-2">
                  {languages.map((language) => (
                    <Link
                      key={language.name}
                      href={`/${language.locale}/v2`}
                      locale={language.locale}
                    >
                      <a className="flex justify-between hover:bg-black-lighter p-2 rounded-lg transition duration-300 ease-in-out">
                        <span className="text-white hover:text-green-light text-sm font-bold">
                          {language.name}
                        </span>
                        {languageNameFromLocale(locale) === language.name && (
                          <CheckCircleIcon className="text-green-light w-5 h-5" />
                        )}
                      </a>
                    </Link>
                  ))}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default LanguageToggle;
