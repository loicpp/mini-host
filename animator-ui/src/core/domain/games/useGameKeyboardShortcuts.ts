import { onMounted, onUnmounted, type Ref } from 'vue';
import { useGameStore } from '../general/stores/game';
import { useMusicStore } from '../general/stores/music';
import { useGamePlayers } from './useGamePlayers';

export interface ModalsState {
  isSettingsDrawerOpen: Ref<boolean>;
  isPlayerActionsModalOpen: Ref<boolean>;
  isPlayersModalOpen: Ref<boolean>;
  isTempTrackModalOpen: Ref<boolean>;
}

export interface GameActions {
  savePlayerActions: () => void;
  toggleProjector: () => void;
  handlePlayMusic: () => void;
  stopMusic: () => void;
  handleRevealResults: () => void;
  handleNextRound: () => void;
  correctBuzzer: () => void;
  handleAutoCorrect: () => void;
  handleSelectTrack: (track: any) => void;
}

export function useGameKeyboardShortcuts(
  modals: ModalsState,
  actions: GameActions,
  gameSidebarRef: Ref<any>
) {
  const { status, gameSettings } = useGameStore();
  const { selectedTrack } = useMusicStore();
  const { hasBuzzed } = useGamePlayers();

  const handleKeydown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

    if (e.key === 'Escape') {
      if (modals.isSettingsDrawerOpen.value) {
        e.preventDefault();
        e.stopPropagation();
        modals.isSettingsDrawerOpen.value = false;
        return;
      } else if (modals.isPlayerActionsModalOpen.value) {
        e.preventDefault();
        e.stopPropagation();
        modals.isPlayerActionsModalOpen.value = false;
        return;
      } else if (modals.isPlayersModalOpen.value) {
        e.preventDefault();
        e.stopPropagation();
        modals.isPlayersModalOpen.value = false;
        return;
      } else if (modals.isTempTrackModalOpen.value) {
        e.preventDefault();
        e.stopPropagation();
        modals.isTempTrackModalOpen.value = false;
        return;
      }
    }

    if (e.key === 'Enter') {
      if (modals.isPlayerActionsModalOpen.value) {
        e.preventDefault();
        e.stopPropagation();
        actions.savePlayerActions();
        return;
      } else if (modals.isPlayersModalOpen.value) {
        e.preventDefault();
        e.stopPropagation();
        modals.isPlayersModalOpen.value = false;
        return;
      }
    }

    if (e.shiftKey && (e.key === 'P' || e.key === 'p')) {
      e.preventDefault();
      actions.toggleProjector();
      return;
    }

    if (isInput) return;

    if (e.key === ' ' || e.key === 'Spacebar') {
      if (target.tagName === 'BUTTON' && status.value === 'reviewing' && gameSettings.value.mode === 'buzzer' && hasBuzzed.value) {
        // Allow native spacebar to click the currently focused button
      } else {
        e.preventDefault();
        if (status.value === 'waiting') {
          if (selectedTrack.value) actions.handlePlayMusic();
        } else if (status.value === 'playing') {
          actions.stopMusic();
        } else if (status.value === 'reviewing') {
          if (!(gameSettings.value.mode === 'buzzer' && hasBuzzed.value)) {
            actions.handleRevealResults();
          }
        } else if (status.value === 'results') {
          actions.handleNextRound();
        }
      }
    } else if (e.key === 'Enter') {
      if (status.value === 'reviewing') {
        if (gameSettings.value.mode === 'buzzer' && hasBuzzed.value) {
          if (target.tagName !== 'BUTTON') {
            e.preventDefault();
            actions.correctBuzzer();
          }
        } else if (gameSettings.value.mode === 'text') {
          e.preventDefault();
          actions.handleAutoCorrect();
        }
      } else if (status.value === 'waiting') {
        if (selectedTrack.value) {
          e.preventDefault();
          actions.handleSelectTrack(null);
        }
      }
    } else if (e.key === 'ArrowUp') {
      if (status.value === 'reviewing' && gameSettings.value.mode === 'buzzer' && hasBuzzed.value) {
        e.preventDefault();
        gameSidebarRef.value?.rejectBuzzerBtn?.btnRef?.focus();
      }
    } else if (e.key === 'ArrowDown') {
      if (status.value === 'reviewing' && gameSettings.value.mode === 'buzzer' && hasBuzzed.value) {
        e.preventDefault();
        gameSidebarRef.value?.validateBuzzerBtn?.btnRef?.focus();
      }
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
  });
}
