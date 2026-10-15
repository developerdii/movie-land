import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },

  // Core recommended rules (syntax + correctness for all JS).
  js.configs.recommended,

  // Vue 3 recommended rules (essential + strongly-recommended + recommended).
  ...pluginVue.configs['flat/recommended'],

  {
    name: 'movie-land/settings',
    files: ['**/*.{js,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.builtin,
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // Legacy migration: many existing components are single-word (Navbar,
      // Slider, Rating, Home). Disabled for now.
      'vue/multi-word-component-names': 'off',

      // Legacy code has unused vars in several places; not enforced yet.
      'no-unused-vars': 'off',

      // Formatting-only rules. This project uses its own hand-formatted style
      // (no Prettier), so these layout conventions would only add noise.
      // Correctness rules stay enabled.
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/attributes-order': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/html-closing-bracket-spacing': 'off',
      'vue/html-indent': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/order-in-components': 'off',
    },
  },
]
