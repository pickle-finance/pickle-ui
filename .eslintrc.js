/* eslint-env node */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
<<<<<<< HEAD
  "env": {
    "browser": true,
    "node": true
  },
  "rules": {
    "@typescript-eslint/ban-ts-ignore": "off"
  }
=======
  rules: {
    "@typescript-eslint/explicit-module-boundary-types": "off",
  },
>>>>>>> Add Gauge & DILL page, integration with contracts
};
