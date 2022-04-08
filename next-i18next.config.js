const HttpBackend = require("i18next-http-backend/cjs");
const path = require("path");

const localePath = path.resolve("./public/locales");

module.exports = {
  i18n: {
    defaultLocale: "en",
    locales: [
      "en",
      "zh-CN",
      "zh-Hans",
      "zh-Hant",
      "zh-SG",
      "zh-TW",
      "zh-HK",
      "es",
      "tr",
      "hi",
      "nl",
    ],
    fallbackLng: {
      "zh-CN": ["zh-Hans", "en"],
      "zh-SG": ["zh-Hans", "en"],
      "zh-TW": ["zh-Hant", "en"],
      "zh-HK": ["zh-Hant", "en"],
      es: ["en"],
      default: ["en"],
    },
    localePath,
    react: {
      useSuspense: false,
    },
  },
  use: process.env.NODE_ENV === "development" && process.browser ? [HttpBackend] : [],
};
