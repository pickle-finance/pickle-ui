import { ThemeState, ThemeType, CurrentTheme } from "v2/store/theme";

type RGB = [r: number, g: number, b: number];
type Tone = "light" | "dark";

interface Theme {
  tone: Tone;
  colors: {
    accent: RGB;
    "accent-light": RGB;
    background: RGB;
    "background-glow": RGB;
    "background-light": RGB;
    "background-lightest": RGB;
    foreground: RGB;
    "foreground-button": RGB;
    "foreground-alt-100": RGB;
    "foreground-alt-200": RGB;
    "foreground-alt-300": RGB;
    "foreground-alt-400": RGB;
    "foreground-alt-500": RGB;
    primary: RGB;
    "primary-light": RGB;
    "primary-dark": RGB;
  };
}

interface ThemeConfig {
  dark: Theme;
  light: Theme;
  [key: string]: Theme | undefined;
}

/**
 * Custom theme definitions
 */
const themes: ThemeConfig = {
  dark: {
    tone: "dark",
    colors: {
      accent: [225, 85, 47],
      "accent-light": [255, 147, 117],
      background: [3, 19, 22],
      "background-glow": [49, 59, 60],
      "background-light": [15, 31, 34],
      "background-lightest": [23, 38, 40],
      foreground: [255, 255, 255],
      "foreground-button": [255, 255, 255],
      "foreground-alt-100": [224, 225, 226],
      "foreground-alt-200": [192, 196, 197],
      "foreground-alt-300": [134, 148, 152],
      "foreground-alt-400": [43, 56, 59],
      "foreground-alt-500": [31, 45, 48],
      primary: [72, 194, 72],
      "primary-light": [94, 237, 93],
      "primary-dark": [6, 85, 6],
    },
  },
  light: {
    tone: "light",
    colors: {
      accent: [239, 114, 80],
      "accent-light": [255, 147, 117],
      background: [252, 255, 252],
      "background-glow": [146, 243, 145],
      "background-light": [211, 249, 207],
      "background-lightest": [235, 255, 236],
      foreground: [60, 70, 60],
      "foreground-button": [252, 255, 252],
      "foreground-alt-100": [95, 118, 95],
      "foreground-alt-200": [111, 137, 111],
      "foreground-alt-300": [134, 166, 135],
      "foreground-alt-400": [158, 195, 159],
      "foreground-alt-500": [190, 233, 191],
      primary: [72, 194, 72],
      "primary-light": [46, 203, 45],
      "primary-dark": [6, 85, 6],
    },
  },
  "9-to-5": {
    tone: "light",
    colors: {
      accent: [208, 2, 27],
      "accent-light": [255, 147, 117],
      background: [255, 255, 255],
      "background-glow": [255, 212, 63],
      "background-light": [255, 238, 148],
      "background-lightest": [255, 249, 215],
      foreground: [0, 0, 0],
      "foreground-button": [252, 255, 252],
      "foreground-alt-100": [141, 117, 37],
      "foreground-alt-200": [161, 149, 109],
      "foreground-alt-300": [189, 162, 69],
      "foreground-alt-400": [217, 188, 89],
      "foreground-alt-500": [255, 224, 115],
      primary: [255, 198, 0],
      "primary-light": [208, 2, 27],
      "primary-dark": [16, 100, 255],
    },
  },
};

export const rareThemes: CurrentTheme[] = Object.keys(themes)
  .filter((name) => name !== "light" && name !== "dark")
  .sort()
  .map((name) => ({
    value: name,
    label: name,
  }));

export const currentTheme = (options: ThemeState): Theme => {
  const { type, current } = options;

  switch (type) {
    case ThemeType.Rare: {
      return themes[current.value]!;
    }
    default:
      return themes[type];
  }
};

export const matchingLogoSrc = (options: ThemeState): string => {
  const theme = currentTheme(options);

  return `/pickle-logo-${theme.tone}.svg`;
};

export const applyTheme = (options: ThemeState) => {
  const root = document.documentElement;
  const theme = currentTheme(options);

  const variables = Object.entries(theme.colors).map(
    ([property, rgb]) => `--color-${property}: ${rgb[0]}, ${rgb[1]}, ${rgb[2]}`,
  );

  root.setAttribute("style", variables.join(";"));
};
