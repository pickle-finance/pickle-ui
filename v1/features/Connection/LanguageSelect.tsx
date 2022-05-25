import { FC } from "react";
import { useRouter } from "next/router";

import { Select } from "@geist-ui/react";

interface Props {
  type: "standalone" | "grouped";
}

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
  {
    name: "Español",
    locale: "es",
  },
  {
    name: "Türkçe",
    locale: "tr",
  },
  {
    name: "हिन्दी",
    locale: "hi",
  },
  {
    name: "Nederlands",
    locale: "nl",
  },
];

const activeLanguage = (locale: string | undefined): string => {
  // Special cases
  switch (locale) {
    case "zh":
    case "zh-CN":
    case "zh-Hans":
    case "zh-SG":
      return "zh-Hans";
    case "zh-Hant":
    case "zh-TW":
    case "zh-HK":
      return "zh-Hant";
  }

  // The rest
  if (locale) return locale;

  return "en";
};

const LanguageSelect: FC<Props> = ({ type }) => {
  const router = useRouter();

  const handleLanguageSwitch = (locale: string) => router.push("", "", { locale });

  const borderRadius = type === "grouped" ? "5px 0 0 5px" : "5px";

  return (
    <Select
      value={activeLanguage(router.locale)}
      onChange={(locale) => handleLanguageSwitch(locale as string)}
      style={{
        borderRadius,
        minWidth: "6rem",
      }}
    >
      {languages.map((language) => (
        <Select.Option key={language.locale} value={language.locale}>
          {language.name}
        </Select.Option>
      ))}
    </Select>
  );
};

export default LanguageSelect;
