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
      @toggle-projector="toggleProjector"
      @leave-game="handleLeaveGame"
      @configure-playlists="handleConfigurePlaylists"
      @play="playMusic"
      @stop="stopMusic"
      @reveal="revealResults"
      @next-round="nextRound"
      @resume-music="resumeMusic"
      @correct-buzzer="correctBuzzer"
      @auto-correct="autoCorrect"
    />

    <main class="flex-1 overflow-y-auto relative p-8">
      <div v-if="gameId" class="flex flex-col gap-6">
        <div class="flex items-center justify-between mb-2 pb-4 border-b border-[rgba(0,0,0,0.05)]">
          <div class="flex items-center gap-3">
            <Badge :color="status === 'waiting' ? 'gray' : status === 'playing' ? 'blue' : status === 'reviewing' ? 'green' : status === 'results' ? 'pink' : 'gray'" class="px-3 py-1 text-xs uppercase tracking-wider">{{ statusDisplay }}</Badge>
          </div>
          <div class="ml-auto flex items-center gap-3">
            <button @click="isPlayersModalOpen = true" class="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-sm hover:bg-gray-100 hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 font-semibold text-primary">
              <Users class="w-5 h-5" /> 
              <span>{{ Object.keys(displayedPlayers).length }} {{ $t('control_panel.players') }}</span>
              <span class="w-2 h-2 rounded-full bg-emerald-400 ml-1"></span>
            </button>
            <Btn variant="ghost-orange" @click="restartGame">
              <RefreshCw class="w-4 h-4 mr-2" /> {{ $t('control_panel.restart') }}
            </Btn>
            <Btn variant="ghost-red" @click="endGame" v-if="status !== 'finished'">
              <Square class="w-4 h-4 mr-2" /> {{ $t('control_panel.stop') }}
            </Btn>
          </div>
        </div>

        <LocalTracksView 
          v-if="status === 'waiting' && (currentSource === 'local' || (currentSource === 'soundcloud' && localTracks.length > 0))"
          :localTracks="localTracks"
          :selectedTrack="selectedTrack"
          :currentSource="currentSource"
          :playedTracks="playedTracks"
          @select-track="selectTrack"
        />

        <div v-if="status === 'reviewing'" class="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl flex flex-wrap items-center justify-center gap-6 mb-4 shadow-sm">
          <h3 class="text-xl font-bold text-blue-700 m-0 flex items-center gap-2">
            🎵 {{ $t('control_panel.expected') }} <span class="px-3 py-1 bg-white rounded-lg border border-blue-200 shadow-sm ml-2">{{ nextTrackInfo.answer || $t('control_panel.unknown_answer') }}</span>
          </h3>
          <Btn v-if="gameSettings.mode === 'text'" variant="blue" className="font-bold shadow-md" @click="autoCorrect">
            <Wand2 class="w-4 h-4 mr-2" /> {{ $t('control_panel.auto_correct') }}
          </Btn>
        </div>

        <PlayersGrid 
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
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              <div v-for="player in displayedPlayers" :key="player.id" 
                   :class="['p-3 rounded-xl border flex items-center gap-3 transition-colors', 
                            player.blockedTurns && player.blockedTurns > 0 ? 'bg-red-50 border-red-200' :
                            player.hasAnswered ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200']">
                <div :class="['w-8 h-8 rounded-full flex items-center justify-center shrink-0', 
                              player.blockedTurns && player.blockedTurns > 0 ? 'bg-red-200 text-red-500' :
                              player.hasAnswered ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400']">
                  <Ban v-if="player.blockedTurns && player.blockedTurns > 0" class="w-4 h-4" />
                  <Check v-else-if="player.hasAnswered" class="w-4 h-4" />
                  <Loader2 v-else class="w-4 h-4 animate-spin" />
                </div>
                <span :class="['font-bold truncate', 
                               player.blockedTurns && player.blockedTurns > 0 ? 'text-red-700 line-through opacity-70' :
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
              <Trophy class="w-5 h-5 text-yellow-500" /> {{ $t('control_panel.points_won') }}
            </h3>
            
            <div class="grid gap-3">
              <div v-for="player in playersWhoWonPoints" :key="player.id" class="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <div class="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">
                  +{{ player.pointsGained }}
                </div>
                <div class="flex-1">
                  <h4 class="font-bold text-lg text-emerald-900 m-0">{{ player.name }}</h4>
                </div>
                <div class="flex flex-col items-end">
                  <div class="font-black text-xl text-emerald-700">{{ player.score }} pts (Total)</div>
                </div>
              </div>
              <div v-if="playersWhoWonPoints.length === 0" class="text-center text-muted-foreground py-8 italic bg-gray-50 rounded-xl border border-gray-100">
                {{ $t('control_panel.no_points_won') }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Players Modal -->
      <Modal v-if="isPlayersModalOpen" @close="isPlayersModalOpen = false" maxW="max-w-2xl">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-[#fff6e0] rounded-xl flex items-center justify-center shadow-sm">
                <Users class="w-5 h-5 text-[#FFBA49]" />
              </div>
              <h2 class="text-2xl font-bold text-primary">{{ $t('control_panel.manage_players') }}</h2>
            </div>
            <button @click="isPlayersModalOpen = false" class="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"><X class="w-5 h-5" /></button>
          </div>
          
          <div class="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-2">
            <div v-if="sortedPlayersList.length === 0" class="text-center p-8 bg-muted/50 rounded-xl border border-dashed border-muted-foreground/30 text-muted-foreground font-medium italic">
              {{ $t('control_panel.no_players_connected') }}
            </div>
            <div v-for="player in sortedPlayersList" :key="player.id" :class="['rounded-xl border p-4 flex flex-col gap-3', player.blockedTurns ? 'border-red-200 bg-red-50/50' : 'border-[rgba(0,0,0,0.08)] bg-[#f5f6fa]']">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-primary text-lg">{{ player.name || $t('control_panel.anonymous') }}</span>
                  <Badge v-if="player.blockedTurns === -1" color="red">{{ $t('control_panel.blocked_permanent') }}</Badge>
                  <Badge v-else-if="player.blockedTurns > 0" color="red">{{ $t('control_panel.blocked_turns', { turns: player.blockedTurns }) }}</Badge>
                </div>
                <span class="font-black text-[#FFBA49] tabular-nums text-lg">{{ player.score || 0 }} {{ $t('gameroom.pts') }}</span>
              </div>
              
              <div class="flex gap-2 flex-wrap items-center justify-between mt-1">
                <div class="flex flex-wrap gap-2">
                  <Btn variant="secondary" size="sm" @click="setPlayerBlock(player.id, 1)">{{ $t('control_panel.plus_one_turn') }}</Btn>
                  <Btn variant="secondary" size="sm" @click="setPlayerBlock(player.id, 3)">{{ $t('control_panel.plus_three_tours') }}</Btn>
                  <Btn :variant="player.blockedTurns ? 'success' : 'danger'" size="sm" @click="setPlayerBlock(player.id, player.blockedTurns ? 0 : -1)">
                    {{ player.blockedTurns ? $t('control_panel.unblock') : $t('control_panel.block_permanently') }}
                  </Btn>
                </div>
                <Btn variant="danger" size="sm" @click="removePlayer(player.id)">{{ $t('control_panel.remove') }}</Btn>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end mt-6">
            <Btn variant="dark" size="md" @click="isPlayersModalOpen = false">{{ $t('control_panel.close') }}</Btn>
          </div>
        </div>
      </Modal>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Users, X, RefreshCw, Square, Wand2, Music, Zap, Check, Loader2, Trophy, Ban } from '@lucide/vue';
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

const { t } = useI18n();
const router = useRouter();

const { leaveGame, toggleProjector, nextRound, endGame, restartGame } = useGameSession();
const { 
  displayedPlayers, sortedPlayersList, playersWhoWonPoints, hasBuzzed, 
  award, revealResults, autoCorrect, correctBuzzer, removePlayer, setPlayerBlock 
} = useGamePlayers();
const { lastPlayedTrack, selectTrack, playMusic, stopMusic, resumeMusic } = useGameMusic();

const isPlayersModalOpen = ref(false);

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

const handleConfigurePlaylists = async () => {
  await leaveGame();
  router.push('/playlists');
};
</script>
