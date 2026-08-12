import { watch, computed } from 'vue';
import { 
  gameId, status, gameSettings, selectedTrack, nextTrackInfo, 
  playedTracks, localTracks, pressedBuzzer, players, musicProgress, musicTimeLeft,
  currentStartTime
} from './state';
import { animatorService } from '../services/animatorService';
import { musicManager } from '../services/music/MusicManager';
import { Track } from '../services/music/MusicProvider';
import { getServerTime } from '../firebase';
import { useDialog } from './useDialog';
import { useI18n } from 'vue-i18n';
import { useGamePlayers } from './useGamePlayers';

let hasMusicStopped = false;
let animationFrameId: number | null = null;
let autoStopTimer: ReturnType<typeof setTimeout> | null = null;

export function useGameMusic() {
  const { t } = useI18n();
  const { showAlert } = useDialog();
  const { setPlayerBlock } = useGamePlayers();

  const lastPlayedTrack = computed(() => {
    if (playedTracks.value.length === 0) return null;
    const lastId = playedTracks.value[playedTracks.value.length - 1];
    return localTracks.value.find((t: Track) => t.id === lastId) || null;
  });

  const selectTrack = (track: Track | null) => {
    selectedTrack.value = track;
    if (track) {
      nextTrackInfo.value.answer = track.artist ? `${track.title} - ${track.artist}` : track.title;
      
      if (typeof musicManager.preload === 'function') {
        musicManager.preload(track).catch((e: any) => console.warn("Preload failed", e));
      }
    } else {
      nextTrackInfo.value.answer = '';
    }
  };

  const playMusic = async () => {
    if (!selectedTrack.value) return;
    
    try {
      if (typeof musicManager.activate === 'function') {
        musicManager.activate().catch(() => console.warn("Activate error"));
      }
      
      status.value = 'playing';
      const delay = 3000;
      const startTime = getServerTime() + delay;
      currentStartTime.value = startTime;
      
      await animatorService.clearPressedBuzzer(gameId.value);
  
      hasMusicStopped = false;
  
      await animatorService.updateGameState(gameId.value, 'playing', {
        startTime: startTime,
        duration: gameSettings.value.duration * 1000,
        musicDuration: gameSettings.value.musicDuration * 1000,
        blockDuration: (gameSettings.value.blockDuration || 0) * 1000,
        answer: nextTrackInfo.value.answer,
        mode: gameSettings.value.mode
      });
      
      if (!playedTracks.value.includes(selectedTrack.value.id)) {
        playedTracks.value.push(selectedTrack.value.id);
        try {
          await fetch('http://127.0.0.1:5000/api/game', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ localTracks: localTracks.value, playedTracks: playedTracks.value, settings: gameSettings.value })
          });
        } catch {
          console.warn("Could not save played tracks");
        }
      }
      
      const timeToWait = startTime - getServerTime();
      
      try {
        if (status.value === 'playing') {
          await musicManager.play(selectedTrack.value!, Math.max(0, timeToWait));
        }
      } catch (err: any) {
        await showAlert({ title: t('dialogs.playback_error.title'), message: t('dialogs.playback_error.message', { err: err.message }) });
        stopMusic();
      }
    } catch (err: any) {
      await showAlert({ title: t('dialogs.launch_error.title'), message: t('dialogs.launch_error.message', { err: err.message }) });
    }
  };

  const stopMusic = async () => {
    await musicManager.stop();
    status.value = 'reviewing';
    await animatorService.updateGameState(gameId.value, 'reviewing');
  };

  const pauseMusic = async () => {
    await musicManager.pause();
    status.value = 'reviewing';
    await animatorService.updateGameState(gameId.value, 'reviewing');
  };

  const resumeMusic = async () => {
    let playerIdToBlock = null;
    if (gameSettings.value.mode === 'buzzer' && pressedBuzzer.value) {
      playerIdToBlock = pressedBuzzer.value;
    }
  
    if (playerIdToBlock) {
      await setPlayerBlock(playerIdToBlock, 1);
      await animatorService.clearPlayerGuess(gameId.value, playerIdToBlock);
      await animatorService.clearPressedBuzzer(gameId.value);
    }
    
    status.value = 'playing';
    await animatorService.updateGameState(gameId.value, 'playing');
    
    const now = getServerTime();
    if (currentStartTime.value && now >= currentStartTime.value + (gameSettings.value.musicDuration * 1000)) {
      hasMusicStopped = true;
    }
    
    if (!hasMusicStopped) {
      await musicManager.resume();
    }
  };

  const startProgressLoop = () => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    
    const loop = () => {
      if (status.value !== 'playing') return;
      
      const now = getServerTime();
      if (currentStartTime.value) {
        const elapsed = now - currentStartTime.value;
        const total = gameSettings.value.duration * 1000;
        musicProgress.value = Math.min(100, Math.max(0, (elapsed / total) * 100));
        musicTimeLeft.value = Math.max(0, Math.ceil((total - elapsed) / 1000));
      }
      
      animationFrameId = requestAnimationFrame(loop);
    };
    
    loop();
  };

  watch(() => status.value, (newStatus) => {
    if (newStatus === 'playing') {
      startProgressLoop();
      if (autoStopTimer) clearTimeout(autoStopTimer);
      const checkTimer = () => {
        if (status.value !== 'playing') return;
        const now = getServerTime();
        
        if (currentStartTime.value && !hasMusicStopped && now >= currentStartTime.value + (gameSettings.value.musicDuration * 1000)) {
          musicManager.pause();
          hasMusicStopped = true;
        }
  
        if (currentStartTime.value && now >= currentStartTime.value + (gameSettings.value.duration * 1000)) {
          stopMusic();
        } else {
          autoStopTimer = setTimeout(checkTimer, 500);
        }
      };
      checkTimer();
    } else {
      if (autoStopTimer) clearTimeout(autoStopTimer);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    }
  });
  
  watch(() => pressedBuzzer.value, (newBuzzer) => {
    if (status.value === 'playing' && newBuzzer && gameSettings.value.mode === 'buzzer') {
      pauseMusic();
    }
  });
  
  watch(() => players.value, (newPlayers) => {
    if (status.value === 'playing' && newPlayers) {
      const playerIds = Object.keys(newPlayers).filter(id => {
        const role = (newPlayers as Record<string, any>)[id].role;
        return role !== 'animator' && role !== 'projector';
      });
      if (playerIds.length > 0) {
        if (gameSettings.value.mode === 'buzzer') {
          const allBlocked = playerIds.every(id => {
            const p = (newPlayers as Record<string, any>)[id];
            return p.blockedTurns === -1 || p.blockedTurns > 0;
          });
          if (allBlocked) {
            stopMusic();
          }
        } else {
          const allSubmitted = playerIds.every(id => {
            const p = (newPlayers as Record<string, any>)[id];
            const isBlocked = p.blockedTurns === -1 || p.blockedTurns > 0;
            const hasGuess = !!p.currentGuess && (!!p.currentGuess.title || !!p.currentGuess.artist || typeof p.currentGuess === 'string' && p.currentGuess.length > 0);
            return isBlocked || hasGuess;
          });
          if (allSubmitted) {
            stopMusic();
          }
        }
      }
    }
  }, { deep: true });

  return {
    lastPlayedTrack,
    selectTrack,
    playMusic,
    stopMusic,
    pauseMusic,
    resumeMusic
  };
}
