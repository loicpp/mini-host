const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

export function usePresets() {
  const loadPresets = async () => {
    try {
      const res = await fetch(`${BASE_URL}/presets`);
      if (!res.ok) throw new Error('Failed to load presets');
      return await res.json();
    } catch (e) {
      console.warn('Could not load presets', e);
      return [];
    }
  };

  const savePresets = async (presets: any) => {
    try {
      const res = await fetch(`${BASE_URL}/presets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(presets)
      });
      if (!res.ok) throw new Error('Failed to save presets');
      return await res.json();
    } catch (e) {
      console.warn('Could not save presets', e);
      return false;
    }
  };

  return {
    loadPresets,
    savePresets
  };
}
