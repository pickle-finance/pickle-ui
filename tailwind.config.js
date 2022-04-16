const withOpacityValue = (variable) => {
  return ({ opacityValue }) =>
    opacityValue ? `rgba(var(${variable}), ${opacityValue})` : `rgb(var(${variable}))`;
};

module.exports = {
  content: ["./pages/**/*.tsx", "./layouts/*.tsx", "./v2/**/*.tsx"],
  theme: {
    fontFamily: {
      body: [
        "Montserrat",
        "ui-sans-serif",
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
      ],
      title: [
        "Poppins",
        "ui-sans-serif",
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
      ],
    },
    boxShadow: {
      DEFAULT: "0px 3px 15px 6px rgba(0, 0, 0, 0.1)",
    },
    extend: {
      colors: {
        accent: {
          DEFAULT: withOpacityValue("--color-accent"),
          light: withOpacityValue("--color-accent-light"),
        },
        background: {
          DEFAULT: withOpacityValue("--color-background"),
          light: withOpacityValue("--color-background-light"),
          lightest: withOpacityValue("--color-background-lightest"),
        },
        foreground: {
          DEFAULT: withOpacityValue("--color-foreground"),
          alt: {
            100: withOpacityValue("--color-foreground-alt-100"),
            200: withOpacityValue("--color-foreground-alt-200"),
            300: withOpacityValue("--color-foreground-alt-300"),
            400: withOpacityValue("--color-foreground-alt-400"),
            500: withOpacityValue("--color-foreground-alt-500"),
          },
          button: withOpacityValue("--color-foreground-button"),
        },
        primary: {
          DEFAULT: withOpacityValue("--color-primary"),
          light: withOpacityValue("--color-primary-light"),
          dark: withOpacityValue("--color-primary-dark"),
        },
      },
      scale: {
        "-1": "-1",
      },
      borderWidth: {
        3: "3px",
      },
      zIndex: {
        // Standard elements, hover states
        60: 60,
        70: 70,
        80: 80,
        // Popovers, modals, overlays
        200: 200,
        210: 210,
        220: 220,
      },
    },
  },
  plugins: [],
};
