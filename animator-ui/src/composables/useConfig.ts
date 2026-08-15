export function useConfig() {
  const loadConfig = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/config');
      if (!res.ok) throw new Error('Failed to load config');
      return await res.json();
    } catch (e) {
      console.warn('Could not load config', e);
      return null;
    }
  };

  const saveConfig = async (config: any) => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (!res.ok) throw new Error('Failed to save config');
      return await res.json();
    } catch (e) {
      console.warn('Could not save config', e);
      return null;
    }
  };

  const markTutorialAsSeen = async () => {
    const config = await loadConfig();
    if (config) {
      config.hasSeenTutorial = true;
      await saveConfig(config);
    }
  };

  return {
    loadConfig,
    saveConfig,
    markTutorialAsSeen
  };
}
