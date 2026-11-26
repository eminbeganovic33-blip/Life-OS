import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    '**/dist/**',
    '.claude/**',
    'node_modules/**',
    'public/sw.js',
    'public/firebase-messaging-sw.js',
    '*.config.js',
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: { react },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' }],
      // Mark identifiers used only inside JSX (e.g. <motion.div>) as used,
      // so framer-motion's `motion` import isn't falsely flagged unused.
      'react/jsx-uses-vars': 'error',
      // Intentional empty catches (best-effort swallows) are fine.
      'no-empty': ['error', { allowEmptyCatch: true }],
      // React-Compiler advisory rules (react-hooks v7). This codebase doesn't
      // use the compiler — keep them as warnings, not blocking errors.
      'react-hooks/purity': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      // Dev-only HMR hint (some files export a helper next to a component).
      // Not a runtime/quality issue — keep as a warning, not a blocking error.
      'react-refresh/only-export-components': 'warn',
    },
  },
])
