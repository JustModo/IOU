// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: 'expo',
  parserOptions: {
    warnOnUnsupportedTypeScriptVersion: false,
  },
  rules: {
    'expo/use-dom-exports': 'off',
  },
  ignorePatterns: ['/dist/*'],
};
