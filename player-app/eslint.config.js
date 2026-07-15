import pluginVue from 'eslint-plugin-vue';

export default [
  { ignores: ['dist/**', 'coverage/**'] },
  ...pluginVue.configs['flat/essential'],
  {
    rules: {
      'vue/multi-word-component-names': 'off'
    }
  }
];
