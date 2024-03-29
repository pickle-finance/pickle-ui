import { Themes } from '@geist-ui/core'

export const geistTheme = Themes.createFromLight({
  type:"darkTheme",
  palette: {
    accents_1: "#111",
    accents_2: "#333",
    accents_3: "#444",
    accents_4: "#666",
    accents_5: "#888",
    accents_6: "#999",
    accents_7: "#eaeaea",
    accents_8: "#fafafa",
    background: "#0e1d15",
    foreground: "#ebebeb",
    selection: "#f81ce5",
    secondary: "#888",
    code: "#79ffe1",
    border: "#26ff91",
    link: "#53ffe2",
  },
  expressiveness: {
    dropdownBoxShadow: "0 0 0 1px #333",
    shadowSmall: "0 0 0 1px #333",
    shadowMedium: "0 0 0 1px #333",
    shadowLarge: "0 0 0 1px #333",
    portalOpacity: 0.75,
  },
})