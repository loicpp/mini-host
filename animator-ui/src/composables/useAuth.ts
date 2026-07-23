import { email, password, loginError, isLoggedIn, currentLanguage, lastGameId } from './state';
import { animatorService } from '../services/animatorService';
import i18n from '../i18n';
import { useI18n } from 'vue-i18n';
import { useDialog } from './useDialog';

export function useAuth() {
  const { t } = useI18n();
  const { showConfirm } = useDialog();

  const attemptAutoLogin = async () => {
    try {
      const configRes = await fetch('http://127.0.0.1:5000/api/config');
      const config = await configRes.json();
      if (config && config.email && config.password) {
        email.value = config.email;
        password.value = config.password;
        await login();
      }
    } catch(e) {
      console.warn("Could not load config", e);
    }
  };

  const login = async (loginEmail?: string, loginPassword?: string) => {
    if (loginEmail) email.value = loginEmail;
    if (loginPassword) password.value = loginPassword;
    try {
      loginError.value = '';
      await animatorService.signIn(email.value, password.value);
      isLoggedIn.value = true;
      
      try {
        await fetch('http://127.0.0.1:5000/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.value, password: password.value })
        });
        
        const configRes = await fetch('http://127.0.0.1:5000/api/config');
        const config = await configRes.json();
        
        if (config.lastGameId) {
          lastGameId.value = config.lastGameId;
        }
        return true;
      } catch (e) {
        console.warn("Backend not available, running in local-only mode", e);
        return false;
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
        await fetch('http://127.0.0.1:5000/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: null, password: null })
        });
      } catch {
        console.warn("Could not clear credentials from config.json");
      }
      
      try {
        if (typeof animatorService.signOut === 'function') {
          await animatorService.signOut();
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
      await fetch('http://127.0.0.1:5000/api/config', {
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
