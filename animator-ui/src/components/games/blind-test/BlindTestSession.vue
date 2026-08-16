<template>
  <div class="flex w-full h-full" @click="handleGlobalClick">
    <GameSidebar 
      ref="gameSidebarRef"
      :status="status"
      :currentSource="currentSource"
      :isProjectorOpen="isProjectorOpen"
      v-model:searchQuery="searchQuery"
      v-model:nextTrackInfo="nextTrackInfo"
      :localTracks="localTracks"
      :selectedTrack="selectedTrack"
      :gameMode="gameSettings.mode"
      :gameId="gameId"
      :gameSettings="gameSettings"
      :hasBuzzed="hasBuzzed"
      :lastPlayedTrack="lastPlayedTrack"
      :players="displayedPlayers"
      :playedCount="playedTracks.length"
      @toggle-projector="toggleProjector"
      @leave-game="handleLeaveGame"
      @configure-playlists="handleConfigurePlaylists"
      @play="handlePlayMusic"
      @stop="stopMusic"
      @reveal="handleRevealResults"
      @next-round="handleNextRound"
      @resume-music="resumeMusic"
      @correct-buzzer="correctBuzzer"
      @auto-correct="handleAutoCorrect"
      @open-settings="isSettingsDrawerOpen = true"
    />

    <main class="flex-1 flex flex-col overflow-hidden relative p-8">
      <div v-if="gameId" class="flex flex-col gap-6 h-full min-h-0">
        <div class="flex items-center justify-between mb-2 pb-4 border-b border-[rgba(0,0,0,0.05)] shrink-0">
          <div id="game-status" class="flex items-center gap-3">
            <Badge :color="status === 'waiting' ? 'gray' : status === 'playing' ? 'blue' : status === 'reviewing' ? 'green' : status === 'results' ? 'pink' : 'gray'" class="px-3 py-1 text-xs uppercase tracking-wider">{{ statusDisplay }}</Badge>
          </div>
          <div class="ml-auto flex items-center gap-3">
            <button id="players-btn" @click="openPlayersModal" class="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-sm hover:bg-gray-100 hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 font-semibold text-primary">
              <Users class="w-5 h-5" /> 
              <span>{{ Object.keys(displayedPlayers).length }} {{ $t('control_panel.players') }}</span>
              <span class="w-2 h-2 rounded-full bg-emerald-400 ml-1"></span>
            </button>
            <Btn id="stop-btn" variant="ghost-red" @click="handleEndGame" v-if="status !== 'finished'">
              <Square class="w-4 h-4 mr-2" /> {{ $t('control_panel.stop') }}
            </Btn>
          </div>
        </div>

        <LocalTracksView 
          ref="localTracksViewRef"
          class="flex-1 min-h-0"
          id="track-selection-panel"
          v-if="status === 'waiting' && (currentSource === 'local' || (currentSource === 'soundcloud' && localTracks.length > 0))"
          :localTracks="localTracks"
          :selectedTrack="selectedTrack"
          :currentSource="currentSource"
          :playedTracks="playedTracks"
          @select-track="handleSelectTrack"
          @open-temp-track-modal="openTempTrackModal"
        />

        <div v-if="status === 'reviewing'" class="bg-blue-50/50 border border-blue-100 p-4 sm:p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 sm:gap-6 mb-4 shadow-sm w-full overflow-hidden">
          <div class="flex items-center gap-4 flex-1 min-w-0">
            <h3 class="text-lg sm:text-xl font-bold text-blue-700 m-0 flex items-center gap-2 sm:gap-3 max-w-full min-w-0">
              <span class="shrink-0">🎵 {{ $t('control_panel.expected') }}</span> 
              <span class="px-3 py-1 sm:px-4 sm:py-2 bg-white rounded-xl border border-blue-200 shadow-sm truncate max-w-full min-w-0">{{ nextTrackInfo.answer || $t('control_panel.unknown_answer') }}</span>
            </h3>
            <Btn id="auto-correct-btn" v-if="gameSettings.mode === 'text'" variant="blue" className="font-bold shadow-md shrink-0 whitespace-nowrap ml-2" @click="handleAutoCorrect">
              <Wand2 class="w-4 h-4 mr-2 shrink-0" /> {{ $t('control_panel.auto_correct') }}
            </Btn>
          </div>
          <div v-if="gameSettings.mode !== 'text'" class="text-xl font-black text-blue-600 font-mono bg-white px-3 py-1 rounded-xl border border-blue-200 shadow-sm shrink-0">
            {{ musicTimeLeft }}s
          </div>
        </div>

        <PlayersGrid 
          id="player-grid"
          v-if="status === 'reviewing' && gameSettings.mode !== 'buzzer'"
          :players="displayedPlayers"
          :gameMode="gameSettings.mode"
          @award="award"
        />

        <div v-if="status === 'reviewing' && gameSettings.mode === 'buzzer' && pressedBuzzer" class="w-full mb-4">
          <div class="bg-gradient-to-r from-red-500 to-rose-600 p-[2px] rounded-2xl shadow-lg">
            <div class="bg-white/95 backdrop-blur-sm rounded-[14px] p-5 flex items-center justify-between gap-6">
              <div class="flex items-center gap-5">
                <div class="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shadow-inner">
                  <Zap class="w-8 h-8 fill-current animate-pulse" />
                </div>
                <div class="flex flex-col text-left">
                  <div class="flex items-center gap-3 mb-1">
                    <h2 class="text-2xl font-black text-slate-800 m-0">{{ displayedPlayers[pressedBuzzer]?.name || $t('control_panel.a_player') }}</h2>
                    <Badge color="red" class="font-bold uppercase tracking-wider text-[10px]">{{ $t('control_panel.buzzed') }}</Badge>
                  </div>
                  <p class="text-slate-500 font-medium text-sm m-0">{{ $t('control_panel.buzzer_pause') }}</p>
                </div>
              </div>
              
              <div class="flex flex-col items-center justify-center bg-slate-50 px-5 py-2 rounded-xl border border-slate-200 shadow-sm shrink-0">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">SCORE</span>
                <span class="text-2xl font-black text-slate-800 tabular-nums leading-none">{{ displayedPlayers[pressedBuzzer]?.score || 0 }} <span class="text-sm text-slate-400">pts</span></span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="status === 'playing'" class="flex flex-col gap-6 animate-in fade-in duration-300">
          <div class="bg-white p-6 rounded-3xl border border-[rgba(0,0,0,0.06)] shadow-sm flex flex-col gap-4">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                  <Music class="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h2 class="text-xl font-bold text-primary">{{ $t('control_panel.playing_now') }}</h2>
                </div>
              </div>
              <div class="text-3xl font-black text-primary font-mono bg-slate-50 px-4 py-2 rounded-xl">
                {{ musicTimeLeft }}s
              </div>
            </div>
            <div class="h-3 bg-gray-100 rounded-full overflow-hidden relative">
              <div class="absolute top-0 left-0 h-full bg-[#FFBA49] transition-all duration-100 ease-linear" :style="{ width: musicProgress + '%' }"></div>
              <div v-if="gameSettings.duration > 0" class="absolute top-0 h-full w-1 bg-red-400 z-10 rounded-full" :style="{ left: (gameSettings.musicDuration / gameSettings.duration * 100) + '%' }" title="Coupure du son"></div>
            </div>
          </div>
        </div>

        <div v-if="(status === 'playing' && (gameSettings.mode === 'text' || (gameSettings.mode === 'buzzer' && gameSettings.blockPlayerOnWrongAnswer !== false))) || (status === 'reviewing' && gameSettings.mode === 'buzzer' && gameSettings.blockPlayerOnWrongAnswer !== false)" class="flex-1 bg-white p-6 rounded-3xl border border-[rgba(0,0,0,0.06)] shadow-sm animate-in fade-in duration-300">
          <h3 class="font-bold text-primary mb-4 flex items-center gap-2">
            <Users class="w-5 h-5 text-muted-foreground" /> {{ $t('control_panel.players_status') }}
          </h3>
          <div id="player-grid-playing" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <div v-for="player in displayedPlayers" :key="player.id" 
                 :class="['p-3 rounded-xl border flex items-center gap-3 transition-colors', 
                          player.blockedTurns && player.blockedTurns !== 0 ? 'bg-red-50 border-red-200' :
                          player.hasAnswered ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200']">
              <div :class="['w-8 h-8 rounded-full flex items-center justify-center shrink-0', 
                            player.blockedTurns && player.blockedTurns !== 0 ? 'bg-red-200 text-red-500' :
                            player.hasAnswered ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400']">
                <Ban v-if="player.blockedTurns && player.blockedTurns !== 0" class="w-4 h-4" />
                <Check v-else-if="player.hasAnswered" class="w-4 h-4" />
                <Loader2 v-else class="w-4 h-4 animate-spin" />
              </div>
              <span :class="['font-bold truncate', 
                             player.blockedTurns && player.blockedTurns !== 0 ? 'text-red-700 line-through opacity-70' :
                             player.hasAnswered ? 'text-emerald-700' : 'text-gray-500']">
                {{ player.name }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="status === 'results'" class="flex flex-col gap-6 animate-in fade-in duration-300">
          <div class="flex-1 bg-white p-6 rounded-3xl border border-[rgba(0,0,0,0.06)] shadow-sm">
            <h3 class="font-bold text-primary mb-6 flex items-center gap-2">
              <Trophy class="w-5 h-5 text-yellow-500" /> {{ $t('control_panel.round_results') }}
            </h3>
            
            <div id="player-rank" class="grid gap-3">
              <div v-for="player in playersRoundResults" :key="player.id" class="flex items-center gap-4 p-4 rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#f5f6fa]">
                <div class="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm font-bold text-gray-700 border border-gray-200">
                  {{ player.currentRank }}
                </div>
                <div class="flex-1 flex items-center gap-3">
                  <h4 class="font-bold text-lg text-primary m-0">{{ player.name }}</h4>
                  <Badge v-if="player.pointsGained > 0" color="green">+{{ player.pointsGained }}</Badge>
                  <Badge v-else-if="player.pointsGained < 0" color="red">{{ player.pointsGained }}</Badge>
                </div>
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-1 font-bold text-sm w-12 justify-end" :class="player.rankChange > 0 ? 'text-emerald-500' : player.rankChange < 0 ? 'text-red-500' : 'text-gray-400'">
                    <template v-if="player.rankChange > 0">
                      <ChevronUp class="w-4 h-4" /> {{ player.rankChange }}
                    </template>
                    <template v-else-if="player.rankChange < 0">
                      <ChevronDown class="w-4 h-4" /> {{ Math.abs(player.rankChange) }}
                    </template>
                    <template v-else>
                      <Minus class="w-4 h-4" />
                    </template>
                  </div>
                  <div class="font-black text-xl text-primary w-24 text-right">{{ player.score }} pts</div>
                </div>
              </div>
              <div v-if="playersRoundResults.length === 0" class="text-center text-muted-foreground py-8 italic bg-gray-50 rounded-xl border border-gray-100">
                {{ $t('control_panel.no_players_connected') }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="status === 'finished'" class="flex-1 flex flex-col items-center justify-center py-12 animate-in zoom-in-95 duration-300">
          <div class="bg-white p-10 rounded-3xl border border-[rgba(0,0,0,0.08)] shadow-xl flex flex-col items-center text-center max-w-md w-full mx-auto">
            <div class="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-6">
              <RefreshCw class="w-10 h-10" />
            </div>
            <h2 class="text-2xl font-black text-primary mb-2">{{ $t('control_panel.game_finished_title') }}</h2>
            <p class="text-muted-foreground mb-8 text-sm">{{ $t('control_panel.game_finished_message') }}</p>
            <div class="flex flex-col gap-3 w-full">
              <Btn variant="primary" size="lg" className="w-full font-bold text-lg" @click="restartGame">
                <RefreshCw class="w-5 h-5 mr-2" /> {{ $t('control_panel.restart') }}
              </Btn>
              <Btn variant="gray" className="w-full font-semibold" @click="handleLeaveGame">
                <ChevronLeft class="w-4 h-4 mr-2" /> {{ $t('control_panel.back_to_menu') }}
              </Btn>
              <Btn id="delete-game-btn" variant="danger" className="w-full font-semibold" @click="handleDeleteAndLeaveGame">
                <Trash2 class="w-4 h-4 mr-2" /> {{ $t('control_panel.delete_game') }}
              </Btn>
            </div>
          </div>
        </div>
      </div>


      <!-- Modals -->
      <PlayersModal 
        :isOpen="isPlayersModalOpen" 
        @close="isPlayersModalOpen = false" 
        @open-actions="openPlayerActionsModal" 
      />

      <PlayerActionsModal 
        ref="playerActionsModalRef"
        :isOpen="isPlayerActionsModalOpen" 
        :player="selectedPlayerForActions"
        @close="isPlayerActionsModalOpen = false"
      />

      <!-- Modale Ajout de Musique Temporaire -->
      <TemporaryTrackModal 
        :isOpen="isTempTrackModalOpen" 
        :initialQuery="tempSearchQuery"
        @close="isTempTrackModalOpen = false" 
        @track-added="handleTempTrackAdded"
      />

      <GameSettingsDrawer
        :isOpen="isSettingsDrawerOpen"
        :gameSettings="gameSettings"
        :isGameOver="status === 'finished'"
        @close="isSettingsDrawerOpen = false"
        @save-settings="handleSaveSettings"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Users, RefreshCw, Square, Wand2, Music, Zap, Check, Loader2, Trophy, Ban, ChevronLeft, Trash2, ChevronUp, ChevronDown, Minus } from '@lucide/vue';
import { useI18n } from 'vue-i18n';

import Btn from '../../ui/Btn.vue';
import Badge from '../../ui/Badge.vue';
import GameSidebar from '../GameSidebar.vue';
import LocalTracksView from '../../setup/playlist/LocalTracksView.vue';
import PlayersGrid from '../PlayersGrid.vue';
import TemporaryTrackModal from '../../general/TemporaryTrackModal.vue';
import GameSettingsDrawer from '../GameSettingsDrawer.vue';
import PlayersModal from './modals/PlayersModal.vue';
import PlayerActionsModal from './modals/PlayerActionsModal.vue';

import { useGameStore } from '../../../core/domain/general/stores/game';
import { useMusicStore } from '../../../core/domain/general/stores/music';
import { useUiStore } from '../../../core/domain/general/stores/ui';
import { usePlayerStore } from '../../../core/domain/general/stores/player';
import type { Track } from '../../../services/music/MusicProvider';
import { useGameSession } from '../../../core/domain/games/useGameSession';
import { useGamePlayers } from '../../../core/domain/games/useGamePlayers';
import { useGameMusic } from '../../../core/domain/games/useGameMusic';
import { useGameKeyboardShortcuts } from '../../../core/domain/games/useGameKeyboardShortcuts';
import { nextTick, watch } from 'vue';

const { gameId, status, nextTrackInfo, gameSettings } = useGameStore();
const { currentSource, searchQuery, localTracks, playedTracks, selectedTrack, musicProgress, musicTimeLeft } = useMusicStore();
const { isProjectorOpen } = useUiStore();
const { pressedBuzzer } = usePlayerStore();


const { t } = useI18n();
const router = useRouter();

const { leaveGame, deleteAndLeaveGame, toggleProjector, nextRound, endGame, restartGame, updateGameSettings } = useGameSession();
const { 
  displayedPlayers, playersRoundResults, hasBuzzed, 
  award, revealResults, autoCorrect, correctBuzzer
} = useGamePlayers();
const { lastPlayedTrack, selectTrack, playMusic, stopMusic, resumeMusic } = useGameMusic();

const gameSidebarRef = ref<any>(null);

const isSettingsDrawerOpen = ref(false);

const handleSaveSettings = async (newSettings: any) => {
  await updateGameSettings(newSettings);
  isSettingsDrawerOpen.value = false;
};

const isPlayersModalOpen = ref(false);
const isPlayerActionsModalOpen = ref(false);
const isTempTrackModalOpen = ref(false);
const tempSearchQuery = ref('');
const selectedPlayerForActions = ref<any>(null);
const playerActionsModalRef = ref<any>(null);

const handleSelectTrack = async (track: any) => {
  selectTrack(track);
  await nextTick();
  if (track) {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  } else {
    localTracksViewRef.value?.focusSearch();
  }
};

const handleGlobalClick = (e: Event) => {
  if (!selectedTrack.value) return;
  if (status.value !== 'waiting') return;
  
  const target = e.target as HTMLElement;
  // Ignore clicks on buttons, inputs, links, or specific modals to avoid unwanted deselections
  if (target && target.closest('button, input, a, [role="button"], #player-list')) {
    return;
  }
  handleSelectTrack(null);
};

const handlePlayMusic = async () => {
  playMusic();
};

const handleAutoCorrect = () => {
  autoCorrect();
};

const handleRevealResults = async () => {
  await revealResults();
};

const handleNextRound = () => {
  nextRound();
};

const handleEndGame = async () => {
  await endGame();
};

useGameKeyboardShortcuts(
  {
    isSettingsDrawerOpen,
    isPlayerActionsModalOpen,
    isPlayersModalOpen,
    isTempTrackModalOpen
  },
  {
    savePlayerActions: () => playerActionsModalRef.value?.savePlayerActions(),
    toggleProjector,
    handlePlayMusic,
    stopMusic,
    handleRevealResults,
    handleNextRound,
    correctBuzzer,
    handleAutoCorrect,
    handleSelectTrack
  },
  gameSidebarRef
);

watch([() => status.value, () => hasBuzzed.value], ([newStatus, newBuzzed]) => {
  if (newStatus === 'reviewing' && newBuzzed && gameSettings.value.mode === 'buzzer') {
    setTimeout(() => {
      gameSidebarRef.value?.validateBuzzerBtn?.btnRef?.focus();
    }, 100);
  }
});



const localTracksViewRef = ref<any>(null);

const openTempTrackModal = (query?: string) => {
  tempSearchQuery.value = query || '';
  isTempTrackModalOpen.value = true;
};

const handleTempTrackAdded = (track: Track) => {
  searchQuery.value = '';
  selectedTrack.value = track;
  if (track.id && localTracksViewRef.value) {
    localTracksViewRef.value.scrollToTrack(track.id);
  }
};

const openPlayersModal = () => {
  isPlayersModalOpen.value = true;
};

const openPlayerActionsModal = (player: any) => {
  selectedPlayerForActions.value = player;
  isPlayerActionsModalOpen.value = true;
};

const statusDisplay = computed(() => {
  if (status.value === 'waiting') return t('control_panel.status_waiting');
  if (status.value === 'playing') return t('control_panel.status_playing');
  if (status.value === 'reviewing') return t('control_panel.status_reviewing');
  if (status.value === 'results') return t('control_panel.status_results');
  if (status.value === 'finished') return t('control_panel.status_finished');
  return status.value;
});

const handleLeaveGame = async () => {
  await leaveGame();
  router.push('/');
};

const handleDeleteAndLeaveGame = async () => {
  const deleted = await deleteAndLeaveGame();
  if (deleted) {
    router.push('/');
  }
};

const handleConfigurePlaylists = async () => {
  await leaveGame();
  router.push('/playlists');
};
</script>
