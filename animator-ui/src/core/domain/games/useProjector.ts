import { useUiStore } from '../general/stores/ui';
import { useGameStore } from '../general/stores/game';
import { localBackendService } from '../../../services/localBackendService';

let projectorWindow: Window | null = null;

export function useProjector() {
  const { isProjectorOpen } = useUiStore();
  const { gameId } = useGameStore();

  const toggleProjector = async () => {
    if (!isProjectorOpen.value) {
      projectorWindow = window.open(`/public?game=${gameId.value}`, 'projectorWindow', 'width=1280,height=720');
      isProjectorOpen.value = true;
      
      if (projectorWindow) {
        const timer = setInterval(() => {
          if (projectorWindow?.closed) {
            clearInterval(timer);
            isProjectorOpen.value = false;
            projectorWindow = null;
          }
        }, 1000);
      }
    } else {
      if (projectorWindow) {
        projectorWindow.close();
        projectorWindow = null;
      }
      isProjectorOpen.value = false;
      await closeProjector();
    }
  };

  const closeProjector = async () => {
    await localBackendService.closeProjector();
  };

  return {
    toggleProjector,
    closeProjector
  };
}
