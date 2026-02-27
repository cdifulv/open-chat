/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  arrowParens: 'always',
  bracketSpacing: true,
  endOfLine: 'auto',
  printWidth: 80,
  quoteProps: 'as-needed',
  trailingComma: 'none',
  useTabs: false,
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  importOrder: [
    '^(vue/(.*)$)|^(vue$)',
    '^(nuxt/(.*)$)|^(nuxt$)|^(#imports$)',
    '<THIRD_PARTY_MODULES>',
    '',
    '^~/types/(.*)$',
    '^~/utils/(.*)$',
    '^~/lib/(.*)$',
    '^~/composables/(.*)$',
    '^~/components/(.*)$',
    '^~/layouts/(.*)$',
    '^~/pages/(.*)$',
    '',
    '^[./]'
  ],
  importOrderParserPlugins: ['typescript', 'decorators-legacy'],
  importOrderTypeScriptVersion: '5.0.0',
  plugins: [
    '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss'
  ]
};

export default config;
