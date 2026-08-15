import { localBackendService, LocalGameData } from '../../../services/localBackendService';

export function useGameData() {
  const loadGameData = async () => {
    return await localBackendService.loadGame();
  };

  const saveGameData = async (data: Partial<LocalGameData>) => {
    await localBackendService.saveGameData(data);
    return data;
  };

  return {
    loadGameData,
    saveGameData
  };
}
