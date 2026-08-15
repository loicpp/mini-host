import { ref } from 'vue';

export function usePresets() {
  const loadPresets = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/presets');
      if (!res.ok) throw new Error('Failed to load presets');
      return await res.json();
    } catch (e) {
      console.warn('Could not load presets', e);
      return [];
    }
  };

  const savePresets = async (presets: any) => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/presets', {
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
