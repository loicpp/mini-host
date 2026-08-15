import { createApp } from 'vue'
import './style.css'
import './driver.css'
import App from './App.vue'
import router from './router'
import i18n from './i18n'

import { useUiStore } from './core/domain/general/stores/ui';

const { currentLanguage } = useUiStore();


const initApp = async () => {
  try {
    const configRes = await fetch('http://127.0.0.1:5000/api/config');
    const config = await configRes.json();
    if (config && config.language) {
      i18n.global.locale.value = config.language as any;
      currentLanguage.value = config.language;
    } else {
      await fetch('http://127.0.0.1:5000/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: i18n.global.locale.value })
      });
    }
  } catch (e) {
    console.warn("Could not load config before mount", e);
  }

  const app = createApp(App)
  app.use(router)
  app.use(i18n)
  app.mount('#app')
}

initApp();
