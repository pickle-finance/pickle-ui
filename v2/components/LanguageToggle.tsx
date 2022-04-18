import { FC } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Popover } from "@headlessui/react";
import { ChevronDownIcon, CheckCircleIcon } from "@heroicons/react/solid";
import { TranslateIcon } from "@heroicons/react/outline";

import { classNames } from "../utils";
import SelectTransition from "./SelectTransition";

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

const LanguageToggle: FC = () => {
  const { locale, asPath } = useRouter();

  return (
    <Popover className="relative mr-3">
      {({ open }) => (
        <>
          <Popover.Button className="group rounded-xl inline-flex items-center text-sm text-foreground-alt-200 font-bold hover:bg-background-light transition duration-300 ease-in-out focus:outline-none px-4 py-2">
            <TranslateIcon className="h-5 w-5" />
            <ChevronDownIcon
              className={classNames(
                open ? "text-accent" : "text-foreground-alt-100",
                "ml-2 h-5 w-5 transition duration-300 ease-in-out",
              )}
              aria-hidden="true"
            />
          </Popover.Button>

          <SelectTransition>
            <Popover.Panel className="absolute z-200 left-1/2 -translate-x-1/2 mt-2 px-2 w-36 max-w-screen-sm sm:px-0">
              <div className="rounded-lg shadow-lg ring-1 ring-background ring-opacity-5 border border-foreground-alt-500 overflow-hidden">
                <div className="relative grid gap-1 bg-background-light p-2">
                  {languages.map((language) => (
                    <Link
                      key={language.name}
                      href={`/${language.locale}${asPath}`}
                      locale={language.locale}
                    >
                      <a className="flex group justify-between items-center hover:bg-background-lightest p-2 rounded-lg transition duration-300 ease-in-out">
                        <span className="text-foreground group-hover:text-primary-light text-sm font-bold">
                          {language.name}
                        </span>
                        {languageNameFromLocale(locale) === language.name && (
                          <CheckCircleIcon className="text-primary-light w-4 h-4" />
                        )}
                      </a>
                    </Link>
                  ))}
                </div>
              </div>
            </Popover.Panel>
          </SelectTransition>
        </>
      )}
    </Popover>
  );
};

export default LanguageToggle;
