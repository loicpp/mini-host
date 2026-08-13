export const updateService = {
  async checkForUpdates(): Promise<{ available: boolean, currentVersion: string, latestVersion: string }> {
    const currentVersion = import.meta.env.VITE_APP_VERSION || '0.0.0';
    if (currentVersion === '0.0.0') {
      return { available: false, currentVersion, latestVersion: currentVersion };
    }

    const response = await fetch('https://api.github.com/repos/loicpp/mini-host/releases/latest');
    
    if (!response.ok) {
      if (response.status === 404) {
        console.info('Vérification de mise à jour ignorée : le dépôt est probablement privé ou aucune release n\'existe.');
      } else {
        console.warn(`Erreur lors de la vérification des mises à jour : HTTP ${response.status}`);
      }
      return { available: false, currentVersion, latestVersion: currentVersion };
    }

    const data = await response.json();
    const latestVersion = data.tag_name.replace(/^v/, '');
    const currentVersionClean = currentVersion.replace(/^v/, '');
    
    if (latestVersion !== currentVersionClean && this.isNewerVersion(latestVersion, currentVersionClean)) {
      return { available: true, currentVersion: currentVersionClean, latestVersion };
    }
    
    return { available: false, currentVersion: currentVersionClean, latestVersion: currentVersionClean };
  },

  isNewerVersion(latest: string, current: string): boolean {
    const l = latest.split('.').map(Number);
    const c = current.split('.').map(Number);
    for (let i = 0; i < Math.max(l.length, c.length); i++) {
      const lVal = l[i] || 0;
      const cVal = c[i] || 0;
      if (lVal > cVal) return true;
      if (lVal < cVal) return false;
    }
    return false;
  }
};
