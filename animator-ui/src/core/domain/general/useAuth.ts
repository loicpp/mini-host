import { useAuthStore } from './stores/auth';
import { useUiStore } from './stores/ui';
import { useGameStore } from './stores/game';
import { authService } from '../../../services/authService';
import i18n from '../../../i18n';
import { useI18n } from 'vue-i18n';
import { useDialog } from './useDialog';

const { email, password, loginError, isLoggedIn } = useAuthStore();
const { currentLanguage } = useUiStore();
const { lastGameId } = useGameStore();

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

export function useAuth() {
  const { t } = useI18n();
  const { showConfirm } = useDialog();

  const attemptAutoLogin = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        email.value = user.email || '';
        isLoggedIn.value = true;
        
        // Charger uniquement les variables non-sensibles depuis l'API locale
        const configRes = await fetch(`${BASE_URL}/config`);
        const config = await configRes.json();
        if (config && config.lastGameId) {
          lastGameId.value = config.lastGameId;
        }
      }
    } catch(e) {
      console.warn("Could not check auth state", e);
    }
  };

  const login = async (loginEmail?: string, loginPassword?: string) => {
    if (loginEmail) email.value = loginEmail;
    if (loginPassword) password.value = loginPassword;
    try {
      loginError.value = '';
      await authService.signIn(email.value, password.value);
      isLoggedIn.value = true;
      
      try {
        const configRes = await fetch(`${BASE_URL}/config`);
        const config = await configRes.json();
        
        if (config.lastGameId) {
          lastGameId.value = config.lastGameId;
        }
        return true;
      } catch (e) {
        console.warn("Backend not available, running in local-only mode", e);
        return true; // The user successfully signed in to Firebase anyway
      }
    } catch {
      loginError.value = t('login.invalid_credentials');
      return false;
    }
  };

  const logout = async () => {
    if (await showConfirm({ title: t('dialogs.logout.title'), message: t('dialogs.logout.message'), confirmText: t('dialogs.logout.confirm'), confirmVariant: "danger" })) {
      email.value = '';
      password.value = '';
      
      try {
        if (typeof authService.signOut === 'function') {
          await authService.signOut();
        }
      } catch (e) {
        console.warn(e);
      }
      
      isLoggedIn.value = false;
      return true;
    }
    return false;
  };

  const saveSettings = async () => {
    try {
      await fetch(`${BASE_URL}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: currentLanguage.value })
      });
    } catch {
      console.warn("Could not save settings to backend");
    }
  };

  const updateLanguage = (lang: string) => {
    currentLanguage.value = lang as any;
    i18n.global.locale.value = lang as any;
  };

  return {
    attemptAutoLogin,
    login,
    logout,
    saveSettings,
    updateLanguage
  };
}
