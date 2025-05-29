export default {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    env: {
      node: true,
      es2021: true,
    },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended', // Use TypeScript rules
      'prettier' // Integrate Prettier if used
    ],
    rules: {
      // Add custom rules here if needed
      "@typescript-eslint/no-var-requires": "off" // Allows require in TypeScript
    }
  };