module.exports = {
  purge: ["./pages/**/*.tsx", "./v2/components/**/*.tsx"],
  darkMode: false, // or 'media' or 'class'
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
      DEFAULT: "0px 3px 20px 15px rgba(0, 0, 0, 0.1);",
    },
    extend: {
      colors: {
        black: {
          DEFAULT: "#031316",
          light: "#0f1f22",
          lighter: "#172628",
        },
        orange: {
          DEFAULT: "#e1562f",
          light: "#ff9375",
          lightest: "#ff807533",
        },
        gray: {
          light: "#c0c4c5",
          dark: "#1f2d30",
        },
        green: {
          DEFAULT: "#48c248",
          light: "#5eed5d",
        },
      },
      scale: {
        "-1": "-1",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
