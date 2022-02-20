type RGB = [r: number, g: number, b: number];

interface Theme {
  background: RGB;
  foreground: RGB;
  primary: RGB;
  "primary-light": RGB;
  "primary-dark": RGB;
  [key: string]: RGB;
}

interface ThemeConfig {
  dark: Theme;
  [key: string]: Theme | undefined;
}

/**
 * Custom theme definitions
 */
const themes: ThemeConfig = {
  dark: {
    background: [3, 19, 22],
    foreground: [255, 255, 255],
    primary: [72, 194, 72],
    "primary-light": [94, 237, 93],
    "primary-dark": [6, 85, 6],
  },
  light: {
    background: [255, 255, 255],
    foreground: [3, 19, 22],
    primary: [72, 194, 72],
    "primary-light": [94, 237, 93],
    "primary-dark": [6, 85, 6],
  },
};

export const applyTheme = (name: string) => {
  const root = document.documentElement;
  const theme = themes[name] || themes["dark"];

  Object.entries<RGB>(theme).forEach(([property, rgb]) => {
    root.style.setProperty(
      `--color-${property}`,
      `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`,
    );
  });
};
