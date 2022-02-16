const withOpacityValue = (variable) => {
  return ({ opacityValue }) =>
    opacityValue
      ? `rgba(var(${variable}), ${opacityValue})`
      : `rgb(var(${variable}))`;
};

const textColor = {
  background: withOpacityValue("--color-background"),
  "color-base": withOpacityValue("--color-text-base"),
  primary: withOpacityValue("--color-primary"),
  "primary-light": withOpacityValue("--color-primary-light"),
};

const backgroundColor = {
  background: withOpacityValue("--color-background"),
  primary: withOpacityValue("--color-primary"),
};

const borderColor = {
  "primary-light": withOpacityValue("--color-primary-light"),
};

const ringColor = {
  background: withOpacityValue("--color-background"),
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
      backgroundColor,
      borderColor,
      ringColor,
      textColor,
      colors: {
        black: {
          light: "#0f1f22",
          lighter: "#172628",
        },
        orange: {
          DEFAULT: "#e1552f",
          light: "#ff9375",
          lightest: "#ff807533",
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
