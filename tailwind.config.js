const withOpacityValue = (variable) => {
  return ({ opacityValue }) =>
    opacityValue
      ? `rgba(var(${variable}), ${opacityValue})`
      : `rgb(var(${variable}))`;
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
      DEFAULT: "0px 3px 20px 15px rgba(0, 0, 0, 0.1)",
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
        foreground: withOpacityValue("--color-foreground"),
        primary: {
          DEFAULT: withOpacityValue("--color-primary"),
          light: withOpacityValue("--color-primary-light"),
          dark: withOpacityValue("--color-primary-dark"),
        },
        gray: {
          light: "#c0c4c5",
          lighter: "#e0e1e2",
          outline: "#2b383b",
          "outline-light": "#869498",
          dark: "#1f2d30",
        },
      },
      scale: {
        "-1": "-1",
      },
      borderWidth: {
        3: "3px",
      },
    },
  },
  plugins: [],
};
