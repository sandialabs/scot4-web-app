module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  setupFiles: ["./tests/unit/index.ts"],
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "<rootDir>/config/CssStub.js",
  }
}
