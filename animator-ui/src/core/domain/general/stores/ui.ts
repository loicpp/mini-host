import { ref } from 'vue';
import i18n from '../../../../i18n';

const currentLanguage = ref(i18n.global.locale.value);
const isProjectorOpen = ref(false);
const showDiagnostics = ref(false);
const isBackendConnected = ref(true);

export function useUiStore() {
  return {
    currentLanguage,
    isProjectorOpen,
    showDiagnostics,
    isBackendConnected,
  };
}
