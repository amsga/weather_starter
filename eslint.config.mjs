import { fileURLToPath } from 'node:url';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      'backend/drizzle/meta/**',
      'backend/weather.db*',
      'backend/logs/**',
      'frontend/.vite/**',
    ],
  },
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    files: ['frontend/src/**/*.{ts,tsx}', 'frontend/**/*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
  {
    files: [
      'backend/src/**/*.{ts,tsx}',
      'scripts/**/*.{js,mjs,ts}',
      '*.ts',
      '*.mjs',
      '*.js',
      'frontend/*.config.{js,ts,mjs}',
      'backend/*.config.{js,ts,mjs}',
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['backend/src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: ['./backend/tsconfig.json'],
        tsconfigRootDir: fileURLToPath(new URL('.', import.meta.url)),
      },
    },
    rules: {},
  },
);
