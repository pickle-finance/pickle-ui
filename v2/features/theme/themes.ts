type RGB = [r: number, g: number, b: number];

interface Theme {
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
  light: {
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
};

export const applyTheme = (name: string) => {
  const root = document.documentElement;
  const theme = themes[name] || themes["dark"];

  const variables = Object.entries(theme).map(
    ([property, rgb]) => `--color-${property}: ${rgb[0]}, ${rgb[1]}, ${rgb[2]}`,
  );

  root.setAttribute("style", variables.join(";"));
};
