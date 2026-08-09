<template>
  <div class="flex w-full h-full">
    <GameSidebar 
      :status="status"
      :currentSource="currentSource"
      :isProjectorOpen="isProjectorOpen"
      v-model:searchQuery="searchQuery"
      v-model:nextTrackInfo="nextTrackInfo"
      :localTracks="localTracks"
      :selectedTrack="selectedTrack"
      :gameMode="gameSettings.mode"
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
    />

    <main class="flex-1 overflow-y-auto relative p-8">
      <div v-if="gameId" class="flex flex-col gap-6">
        <div class="flex items-center justify-between mb-2 pb-4 border-b border-[rgba(0,0,0,0.05)]">
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
          id="track-selection-panel"
          v-if="status === 'waiting' && (currentSource === 'local' || (currentSource === 'soundcloud' && localTracks.length > 0))"
          :localTracks="localTracks"
          :selectedTrack="selectedTrack"
          :currentSource="currentSource"
          :playedTracks="playedTracks"
          @select-track="handleSelectTrack"
        />

        <div v-if="status === 'reviewing'" class="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl flex flex-wrap items-center justify-center gap-6 mb-4 shadow-sm">
          <h3 class="text-xl font-bold text-blue-700 m-0 flex items-center gap-2">
            🎵 {{ $t('control_panel.expected') }} <span class="px-3 py-1 bg-white rounded-lg border border-blue-200 shadow-sm ml-2">{{ nextTrackInfo.answer || $t('control_panel.unknown_answer') }}</span>
          </h3>
          <Btn id="auto-correct-btn" v-if="gameSettings.mode === 'text'" variant="blue" className="font-bold shadow-md" @click="handleAutoCorrect">
            <Wand2 class="w-4 h-4 mr-2" /> {{ $t('control_panel.auto_correct') }}
          </Btn>
        </div>

        <PlayersGrid 
          id="player-grid"
          v-if="status === 'reviewing'"
          :players="displayedPlayers"
          :gameMode="gameSettings.mode"
          @award="award"
        />

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

          <div v-if="gameSettings.mode === 'buzzer' && pressedBuzzer" class="flex-1 bg-red-50 border-2 border-red-200 p-8 rounded-3xl flex flex-col items-center justify-center text-center shadow-inner animate-in zoom-in-95 duration-200">
            <div class="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white shadow-xl mb-6 animate-bounce">
              <Zap class="w-10 h-10 fill-current" />
            </div>
            <h2 class="text-4xl font-black text-red-600 mb-2">{{ displayedPlayers[pressedBuzzer]?.name || $t('control_panel.a_player') }} {{ $t('control_panel.buzzed') }}</h2>
            <p class="text-red-500/80 font-bold text-xl">{{ $t('control_panel.buzzer_pause') }}</p>
          </div>

          <div v-if="gameSettings.mode === 'text'" class="flex-1 bg-white p-6 rounded-3xl border border-[rgba(0,0,0,0.06)] shadow-sm">
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

      <!-- Players Modal -->
      <Modal v-if="isPlayersModalOpen" @close="isPlayersModalOpen = false" maxW="max-w-2xl">
        <div id="player-list" class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-[#fff6e0] rounded-xl flex items-center justify-center shadow-sm">
                <Users class="w-5 h-5 text-[#FFBA49]" />
              </div>
              <h2 class="text-2xl font-bold text-primary">{{ $t('control_panel.manage_players') }}</h2>
            </div>
            <button id="players-modal-close-btn" @click="isPlayersModalOpen = false" class="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"><X class="w-5 h-5" /></button>
          </div>
          
          <div class="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-2">
            <div v-if="sortedPlayersList.length === 0" class="text-center p-8 bg-muted/50 rounded-xl border border-dashed border-muted-foreground/30 text-muted-foreground font-medium italic">
              {{ $t('control_panel.no_players_connected') }}
            </div>
            <div v-for="player in sortedPlayersList" :key="player.id" :class="['rounded-xl border p-4 flex items-center justify-between gap-3', player.blockedTurns ? 'border-red-200 bg-red-50/50' : 'border-[rgba(0,0,0,0.08)] bg-[#f5f6fa]']">
              <div class="flex items-center gap-2 flex-1 overflow-hidden">
                <span class="font-bold text-primary text-lg truncate">{{ player.name || $t('control_panel.anonymous') }}</span>
                <Badge v-if="player.blockedTurns === -1" color="red" class="shrink-0">{{ $t('control_panel.blocked_permanent') }}</Badge>
                <Badge v-else-if="player.blockedTurns > 0" color="red" class="shrink-0">{{ $t('control_panel.blocked_turns', { turns: player.blockedTurns }) }}</Badge>
              </div>
              
              <div class="flex items-center gap-2 shrink-0">
                <span class="font-black text-[#FFBA49] tabular-nums text-lg mr-2">{{ player.score || 0 }} {{ $t('gameroom.pts') }}</span>
                
                <button 
                  class="player-actions-btn w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 bg-gray-200/60 hover:bg-gray-200 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-200/60 disabled:hover:text-gray-600"
                  :title="$t('control_panel.actions')"
                  @click="openPlayerActionsModal(player)"
                  :disabled="status === 'finished'"
                >
                  <Settings class="w-4 h-4" />
                </button>

                <button 
                  class="w-9 h-9 rounded-xl flex items-center justify-center text-red-600 bg-red-100 hover:bg-red-200 hover:text-red-700 transition-colors"
                  :title="$t('control_panel.remove')"
                  @click="removePlayer(player.id)"
                >
                  <UserMinus class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end mt-6">
            <Btn variant="dark" size="md" @click="isPlayersModalOpen = false">{{ $t('control_panel.close') }}</Btn>
          </div>
        </div>
      </Modal>

      <!-- Player Actions Modal -->
      <Modal v-if="isPlayerActionsModalOpen" @close="isPlayerActionsModalOpen = false" maxW="max-w-md">
        <div id="player-actions-modal" class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shadow-sm">
                <Settings class="w-5 h-5 text-gray-600" />
              </div>
              <h2 class="text-xl font-bold text-primary">{{ $t('control_panel.actions') }} - {{ selectedPlayerForActions?.name }}</h2>
            </div>
            <button @click="isPlayerActionsModalOpen = false" class="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"><X class="w-5 h-5" /></button>
          </div>
          
          <div class="flex flex-col gap-6">
            <!-- Points Section -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <p class="text-sm font-semibold text-muted-foreground uppercase tracking-wider m-0">{{ $t('control_panel.adjust_points') }}</p>
                <span class="font-black text-[#FFBA49] tabular-nums bg-amber-50 px-2 py-1 rounded-md">{{ (selectedPlayerForActions?.score || 0) + tempScoreAdjustment }} {{ $t('gameroom.pts') }}</span>
              </div>
              <div class="grid grid-cols-6 gap-2">
                <Btn variant="danger" @click="handleTempPoints(-2)">-2</Btn>
                <Btn variant="danger" @click="handleTempPoints(-1)">-1</Btn>
                <Btn variant="danger" @click="handleTempPoints(-0.5)">-0.5</Btn>
                <Btn variant="success" @click="handleTempPoints(0.5)">+0.5</Btn>
                <Btn variant="success" @click="handleTempPoints(1)">+1</Btn>
                <Btn variant="success" @click="handleTempPoints(2)">+2</Btn>
              </div>
            </div>

            <hr class="border-[rgba(0,0,0,0.08)] m-0" />

            <div>
              <p class="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider m-0">{{ $t('control_panel.suspend_participation') }}</p>
              
              <div v-if="showUnblockOnly">
                <Btn variant="success" className="w-full justify-center font-bold" @click="showUnblockOnly = false; tempBlockedTurns = 0">
                  {{ $t('control_panel.lift_suspension') }}
                </Btn>
              </div>
              <div v-else class="grid grid-cols-3 gap-2">
                <Btn :variant="tempBlockedTurns === 1 ? 'dark-gray' : 'soft'" @click="tempBlockedTurns = tempBlockedTurns === 1 ? 0 : 1">{{ $t('control_panel.one_turn') }}</Btn>
                <Btn :variant="tempBlockedTurns === 3 ? 'dark-gray' : 'soft'" @click="tempBlockedTurns = tempBlockedTurns === 3 ? 0 : 3">{{ $t('control_panel.three_turns') }}</Btn>
                <Btn :variant="tempBlockedTurns === -1 ? 'black' : 'gray-medium'" @click="tempBlockedTurns = tempBlockedTurns === -1 ? 0 : -1">{{ $t('control_panel.permanently') }}</Btn>
              </div>
            </div>

            <div class="flex justify-end mt-2 gap-3">
              <Btn id="player-actions-cancel-btn" variant="gray" @click="isPlayerActionsModalOpen = false">{{ $t('app.cancel') }}</Btn>
              <Btn variant="primary" :disabled="!hasUnsavedChanges" @click="savePlayerActions">{{ $t('settings.save') }}</Btn>
            </div>
          </div>
        </div>
      </Modal>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Users, X, RefreshCw, Square, Wand2, Music, Zap, Check, Loader2, Trophy, Ban, ChevronLeft, Trash2, Settings, UserMinus, ChevronUp, ChevronDown, Minus } from '@lucide/vue';
import { useI18n } from 'vue-i18n';

import Btn from '../../ui/Btn.vue';
import Badge from '../../ui/Badge.vue';
import Modal from '../../ui/Modal.vue';
import GameSidebar from '../../control-panel/GameSidebar.vue';
import LocalTracksView from '../../control-panel/LocalTracksView.vue';
import PlayersGrid from '../../control-panel/PlayersGrid.vue';

import { 
  gameId, status, currentSource, isProjectorOpen, searchQuery, nextTrackInfo,
  localTracks, selectedTrack, gameSettings, playedTracks, pressedBuzzer, musicProgress, musicTimeLeft
} from '../../../composables/state';
import { useGameSession } from '../../../composables/useGameSession';
import { useGamePlayers } from '../../../composables/useGamePlayers';
import { useGameMusic } from '../../../composables/useGameMusic';
import { useTutorial } from '../../../composables/useTutorial';
import { onMounted, nextTick } from 'vue';

const { t } = useI18n();
const router = useRouter();

const { leaveGame, deleteAndLeaveGame, toggleProjector, nextRound, endGame, restartGame } = useGameSession();
const { 
  displayedPlayers, sortedPlayersList, playersRoundResults, hasBuzzed, 
  award, revealResults, autoCorrect, correctBuzzer, removePlayer, setPlayerBlock, addPointsManually
} = useGamePlayers();
const { lastPlayedTrack, selectTrack, playMusic, stopMusic, resumeMusic } = useGameMusic();
const { playGameSessionSequence, advanceToTrackSelected, advanceToMusicLaunched, advanceTutorialStep, advanceToPlayerMenu, advanceToPlayerActions } = useTutorial();

const handleSelectTrack = async (track: any) => {
  selectTrack(track);
  await nextTick();
  advanceToTrackSelected();
};

const handlePlayMusic = async () => {
  playMusic();
  await nextTick();
  advanceToMusicLaunched();
};

const handleAutoCorrect = () => {
  autoCorrect();
  advanceTutorialStep();
};

const handleRevealResults = async () => {
  await revealResults();
  setTimeout(() => {
    advanceTutorialStep();
  }, 500);
};

const handleNextRound = () => {
  nextRound();
  advanceTutorialStep();
};

const handleEndGame = async () => {
  advanceTutorialStep();
  await endGame();
};

onMounted(async () => {
  playGameSessionSequence();
});

const isPlayersModalOpen = ref(false);
const isPlayerActionsModalOpen = ref(false);
const selectedPlayerForActions = ref<any>(null);
const tempScoreAdjustment = ref(0);
const tempBlockedTurns = ref(0);
const showUnblockOnly = ref(false);

const openPlayersModal = () => {
  isPlayersModalOpen.value = true;
  setTimeout(() => {
    advanceToPlayerMenu();
  }, 600);
};

const openPlayerActionsModal = (player: any) => {
  selectedPlayerForActions.value = player;
  tempScoreAdjustment.value = 0;
  tempBlockedTurns.value = player.blockedTurns || 0;
  showUnblockOnly.value = !!player.blockedTurns;
  isPlayerActionsModalOpen.value = true;
  setTimeout(() => {
    advanceToPlayerActions();
  }, 600);
};

const hasUnsavedChanges = computed(() => {
  if (!selectedPlayerForActions.value) return false;
  const initialBlockedTurns = selectedPlayerForActions.value.blockedTurns || 0;
  return tempScoreAdjustment.value !== 0 || tempBlockedTurns.value !== initialBlockedTurns;
});

const handleTempPoints = (points: number) => {
  const currentScore = selectedPlayerForActions.value?.score || 0;
  let newTotal = currentScore + tempScoreAdjustment.value + points;
  if (newTotal < 0) {
    newTotal = 0;
  }
  tempScoreAdjustment.value = newTotal - currentScore;
};

const savePlayerActions = async () => {
  if (selectedPlayerForActions.value) {
    if (tempScoreAdjustment.value !== 0) {
      await addPointsManually(selectedPlayerForActions.value.id, tempScoreAdjustment.value);
    }
    if (tempBlockedTurns.value !== (selectedPlayerForActions.value.blockedTurns || 0)) {
      await setPlayerBlock(selectedPlayerForActions.value.id, tempBlockedTurns.value);
    }
  }
  isPlayerActionsModalOpen.value = false;
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
