const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

export function useGameData() {
  const loadGameData = async () => {
    try {
      const res = await fetch(`${BASE_URL}/game`);
      if (!res.ok) throw new Error('Failed to load game data');
      return await res.json();
    } catch (e) {
      console.warn('Could not load game data', e);
      return null;
    }
  };

  const saveGameData = async (data: any) => {
    try {
      const res = await fetch(`${BASE_URL}/game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to save game data');
      return await res.json();
    } catch (e) {
      console.warn('Could not save game data', e);
      return null;
    }
  };

  return {
    loadGameData,
    saveGameData
  };
}
