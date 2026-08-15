export function useGameData() {
  const loadGameData = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/game');
      if (!res.ok) throw new Error('Failed to load game data');
      return await res.json();
    } catch (e) {
      console.warn('Could not load game data', e);
      return null;
    }
  };

  const saveGameData = async (data: any) => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/game', {
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
