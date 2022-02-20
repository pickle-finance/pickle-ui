type RGB = [r: number, g: number, b: number];

interface Theme {
  background: RGB;
  "background-light": RGB;
  "background-lightest": RGB;
  foreground: RGB;
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
    background: [3, 19, 22],
    "background-light": [15, 31, 34],
    "background-lightest": [23, 38, 40],
    foreground: [255, 255, 255],
    primary: [72, 194, 72],
    "primary-light": [94, 237, 93],
    "primary-dark": [6, 85, 6],
  },
  light: {
    background: [255, 255, 255],
    "background-light": [233, 245, 233],
    "background-lightest": [233, 245, 233],
    foreground: [3, 19, 22],
    primary: [72, 194, 72],
    "primary-light": [94, 237, 93],
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
