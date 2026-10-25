<template>
  <aside class="w-[300px] bg-white text-primary p-6 flex flex-col border-r border-[rgba(0,0,0,0.05)] h-full shadow-sm">
    <BackButton id="btn-quit-game" class="mb-6 self-start hover:text-[#f1416c]" @click="$emit('leave-game')">
      {{ $t('sidebar.quit') }}
    </BackButton>
    
    <div class="h-[100px] shrink-0 flex flex-col justify-center">
      <div class="w-full" v-if="status !== 'waiting'">
        <div class="flex items-center justify-between mb-2">
          <p class="text-[10px] font-bold text-muted-foreground tracking-wider uppercase m-0">{{ $t('sidebar.playing') }}</p>
          <div class="text-[10px] font-bold bg-muted px-2 py-0.5 rounded-md text-muted-foreground" v-if="playedCount !== undefined && playedCount > 0">{{ playedCount }} {{ $t('sidebar.played') }}</div>
        </div>
        <div class="bg-[#fff6e0] text-[#3F4739] p-4 rounded-xl shadow-sm border border-[#fef3c7] relative group overflow-hidden">
          <template v-if="selectedTrack || lastPlayedTrack">
            <div :class="['transition-all duration-500', status === 'playing' ? 'blur-[6px] opacity-30 group-hover:blur-none group-hover:opacity-100 select-none' : '']">
              <div class="font-bold truncate">{{ (selectedTrack || lastPlayedTrack)?.title }}</div>
              <div class="text-sm opacity-80 truncate">{{ (selectedTrack || lastPlayedTrack)?.artist }}<template v-if="(selectedTrack || lastPlayedTrack)?.year"> - {{ (selectedTrack || lastPlayedTrack)?.year }}</template></div>
            </div>
            
            <div v-if="status === 'playing'" class="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-500 pointer-events-none">
              <EyeOff class="w-6 h-6 text-[#3F4739]/50" />
            </div>
          </template>
          <template v-else-if="nextTrackInfo.answer">
            <div :class="['transition-all duration-500', status === 'playing' ? 'blur-[6px] opacity-30 group-hover:blur-none group-hover:opacity-100 select-none' : '']">
              <div class="font-bold truncate" :title="nextTrackInfo.answer">{{ nextTrackInfo.answer }}</div>
            </div>
            <div v-if="status === 'playing'" class="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-500 pointer-events-none">
              <EyeOff class="w-6 h-6 text-[#3F4739]/50" />
            </div>
          </template>
          <template v-else>
            <div class="text-sm italic opacity-70">{{ $t('sidebar.no_music') }}</div>
          </template>
        </div>
      </div>
      <div class="w-full" v-else>
        <template v-if="lastPlayedTrack">
          <div class="flex items-center justify-between mb-2">
            <p class="text-[10px] font-bold text-muted-foreground tracking-wider uppercase m-0">{{ $t('sidebar.last_music') }}</p>
            <div class="text-[10px] font-bold bg-muted px-2 py-0.5 rounded-md text-muted-foreground" v-if="playedCount !== undefined && playedCount > 0">{{ playedCount }} {{ $t('sidebar.played') }}</div>
          </div>
          <div class="bg-gray-50 text-gray-700 p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="font-bold truncate">{{ lastPlayedTrack.title }}</div>
            <div class="text-sm opacity-80 truncate">{{ lastPlayedTrack.artist }}<template v-if="lastPlayedTrack.year"> - {{ lastPlayedTrack.year }}</template></div>
          </div>
        </template>
        <template v-else>
          <h2 class="text-3xl font-black text-[#FFBA49] leading-tight">
            {{ $t('sidebar.blind_test') }} <br/> <span class="text-xl text-primary font-medium">{{ $t('sidebar.regie') }}</span>
          </h2>
        </template>
      </div>
    </div>
    
    <div class="h-px bg-[rgba(0,0,0,0.05)] w-full my-4 shrink-0"></div>

    <div class="h-[120px] flex flex-col justify-center shrink-0 w-full">
      <div class="flex flex-col gap-4 w-full" v-if="status === 'waiting'">
        <Btn 
          id="music-control-btn" 
          variant="blue" 
          className="w-full font-bold" 
          @click="$emit('play')" 
          :disabled="!selectedTrack && (!localTracks || localTracks.length === 0)"
        >
          <Shuffle v-if="!selectedTrack" class="w-5 h-5 mr-2" />
          <Play v-else class="w-5 h-5 mr-2" />
          {{ selectedTrack ? $t('sidebar.play_music') : $t('sidebar.play_random_music') }}
        </Btn>
      </div>

      <div class="flex flex-col gap-4 w-full" v-if="status === 'playing'">
        <Btn variant="success" className="w-full font-bold" @click="$emit('stop')">
          <Square class="w-5 h-5 mr-2 fill-current" /> {{ $t('sidebar.stop_music') }}
        </Btn>
      </div>

      <div class="flex flex-col gap-3 w-full" v-if="status === 'reviewing'">
        <template v-if="gameMode === 'buzzer' && hasBuzzed">
          <Btn id="btn-reject-buzzer" ref="rejectBuzzerBtn" variant="ghost" className="w-full font-bold text-blue-600 border border-blue-200 bg-blue-50" @click="$emit('resume-music')">
            <X class="w-4 h-4 mr-2" /> {{ $t('sidebar.wrong_resume') }}
          </Btn>
          <div class="relative flex w-full">
            <Btn id="btn-validate-buzzer" ref="validateBuzzerBtn" variant="pink" className="flex-1 font-bold rounded-r-none" @click="handleCorrectBuzzer(1, false)">
              <Check class="w-4 h-4 mr-2" /> {{ $t('sidebar.correct_reveal') }}
            </Btn>
            <button
              type="button"
              @click.stop="isBonusDropdownOpen = !isBonusDropdownOpen"
              :title="$t('players_grid.bonus_options')"
              class="px-2.5 bg-pink-500 hover:bg-pink-600 active:scale-[0.98] text-white rounded-r-xl border-l border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-sm"
            >
              <ChevronDown class="w-4 h-4 transition-transform" :class="{ 'rotate-180': isBonusDropdownOpen }" />
            </button>

            <!-- Dropdown -->
            <div
              v-if="isBonusDropdownOpen"
              class="absolute top-full left-0 mt-1.5 w-full bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 flex flex-col text-sm"
            >
              <div class="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles class="w-3.5 h-3.5 text-purple-500" />
                {{ $t('control_panel.bonus') }}
              </div>
              <button
                v-for="bonus in [2, 3, 4, 5]"
                :key="bonus"
                @click.stop="handleCorrectBuzzer(bonus, true)"
                class="px-3 py-2 text-left font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-700 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>+{{ bonus }} {{ $t('gameroom.pts') }}</span>
                <span class="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">+{{ bonus }}</span>
              </button>
            </div>
          </div>
        </template>
        <template v-else>
          <Btn id="submit-correction-btn" variant="pink" className="w-full font-bold" @click="$emit('reveal')">
            <Eye class="w-4 h-4 mr-2" /> {{ gameMode === 'buzzer' ? $t('sidebar.nobody_found') : $t('sidebar.reveal_results') }}
          </Btn>
        </template>
      </div>
      
      <div class="flex flex-col gap-4 w-full" v-if="status === 'results'">
        <Btn id="next-round-btn" variant="gray" className="w-full font-bold" @click="$emit('next-round')">
          <ChevronRight class="w-5 h-5 mr-2" /> {{ $t('sidebar.next_round') }}
        </Btn>
      </div>
    </div>

    <div class="h-px bg-[rgba(0,0,0,0.05)] w-full my-4 shrink-0"></div>

    <div class="flex-1 overflow-y-auto min-h-0 flex flex-col justify-start">
      <button 
        v-if="gameId && gameSettings" 
        @click="$emit('open-settings')"
        class="w-full text-left bg-gray-50 opacity-70 hover:opacity-100 transition-all cursor-pointer border border-gray-100 p-4 rounded-xl shadow-sm text-sm flex flex-col gap-3 relative overflow-hidden group"
      >
        <!-- Background decoration -->
        <div class="absolute -right-4 -top-4 w-16 h-16 bg-white/40 rounded-full blur-xl pointer-events-none"></div>

        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5"><Info class="w-3.5 h-3.5" /> {{ $t('sidebar.game_info') }}</span>
          <span class="font-mono font-bold text-primary bg-white px-2 py-0.5 rounded border border-gray-100 shadow-sm">#{{ gameId }}</span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-gray-600 font-medium flex items-center gap-1.5"><MessageSquare class="w-3.5 h-3.5 text-gray-400" /> {{ $t('sidebar.response_type') }}</span>
          <span class="font-bold text-gray-800 flex items-center gap-1.5 bg-white border border-gray-200 px-2.5 py-0.5 rounded-full text-xs shadow-sm">
            <Bell v-if="gameMode === 'buzzer'" class="w-3.5 h-3.5 text-gray-400" />
            <Type v-else class="w-3.5 h-3.5 text-gray-400" />
            {{ gameMode === 'buzzer' ? $t('create_game.mode_buzzer_title') : $t('create_game.mode_text_title') }}
          </span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-gray-600 font-medium flex items-center gap-1.5"><Gamepad2 class="w-3.5 h-3.5 text-gray-400" /> {{ $t('sidebar.game_mode') }}</span>
          <span class="font-bold text-gray-800 flex items-center gap-1.5 bg-white border border-gray-200 px-2.5 py-0.5 rounded-full text-xs shadow-sm">
            <component :is="IconMap[gameSettings.presetIcon] || IconMap['Settings2']" class="w-3.5 h-3.5 text-gray-400" />
            {{ ['normal', 'hard', 'fun', 'peaceful', 'custom'].includes(gameSettings.preset || 'custom') ? $t('create_game.quick_mode_' + (gameSettings.preset || 'custom')) : gameSettings.preset }}
          </span>
        </div>

        <div class="flex gap-2 mt-1">
          <div class="flex-1 bg-white border border-gray-100 rounded-lg p-2 flex flex-col items-center justify-center gap-1 shadow-sm" title="Temps de blocage">
            <Clock class="w-3.5 h-3.5 text-gray-400" />
            <span class="font-bold text-xs">{{ gameSettings.blockDuration }}s</span>
          </div>
          <div class="flex-1 bg-white border border-gray-100 rounded-lg p-2 flex flex-col items-center justify-center gap-1 shadow-sm" :title="isInfiniteDuration(gameSettings.musicDuration) ? $t('create_game.full_track_tooltip') : 'Durée de la musique'">
            <Music class="w-3.5 h-3.5 text-amber-500" />
            <span class="font-bold text-xs">
              <span v-if="isInfiniteDuration(gameSettings.musicDuration)" class="text-sm leading-none font-bold">∞</span>
              <template v-else>{{ gameSettings.musicDuration }}s</template>
            </span>
          </div>
          <div class="flex-1 bg-white border border-gray-100 rounded-lg p-2 flex flex-col items-center justify-center gap-1 shadow-sm" :title="isInfiniteDuration(gameSettings.duration) ? $t('create_game.full_track_tooltip') : 'Temps total'">
            <Hourglass class="w-3.5 h-3.5 text-blue-500" />
            <span class="font-bold text-xs">
              <span v-if="isInfiniteDuration(gameSettings.duration)" class="text-sm leading-none font-bold">∞</span>
              <template v-else>{{ gameSettings.duration }}s</template>
            </span>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 mt-1 border-t border-gray-100 pt-3">
          <template v-for="opt in BLIND_TEST_ADDITIONAL_OPTIONS" :key="opt.key">
            <div 
              v-if="gameSettings[opt.key as keyof typeof gameSettings] && (!opt.requiredMode || gameMode === opt.requiredMode)"
              class="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border shadow-sm"
              :class="opt.sidebarBadgeClass"
            >
              <component :is="opt.icon" class="w-3.5 h-3.5" />
              {{ $t(opt.shortTitleKey) }}
            </div>
          </template>
        </div>
      </button>
    </div>

    <div class="mt-4 pt-4 border-t border-[rgba(0,0,0,0.05)] shrink-0">
      <Btn id="projector-btn" variant="secondary" className="w-full font-bold bg-[#fff6e0] text-[#3F4739] hover:bg-[#ffe8a0]" @click="handleToggleProjector()">
        <Monitor class="w-4 h-4 mr-2" /> {{ isProjectorOpen ? $t('sidebar.close_projector') : $t('sidebar.open_projector') }}
      </Btn>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { Monitor, Play, Square, X, Check, ChevronRight, EyeOff, Eye, Bell, Type, Clock, Music, Hourglass, Zap, Smile, Leaf, Settings2, Info, MessageSquare, Gamepad2, Star, Bookmark, Heart, Coffee, Flame, Shield, Ghost, Trophy, Target, Rocket, ChevronDown, Sparkles, Shuffle } from '@lucide/vue';
import { BLIND_TEST_ADDITIONAL_OPTIONS } from '../../core/domain/games/blind-test/types/blindTestOptions';
import { Track } from '../../services/music/MusicProvider';
import { isInfiniteDuration } from '../../core/domain/models/Game';
import Btn from '../ui/Btn.vue';
import BackButton from '../ui/BackButton.vue';

const IconMap: Record<string, any> = { 
  Clock, Zap, Smile, Leaf, Settings2, 
  Star, Bookmark, Heart, Coffee, Flame, Shield, Ghost, Gamepad2, Trophy, Target, Rocket 
};

const props = defineProps<{
  status: string;
  currentSource: string;
  isProjectorOpen: boolean;
  searchQuery: string;
  localTracks: Track[];
  selectedTrack: Track | null;
  nextTrackInfo: { answer: string };
  gameMode: string;
  gameId?: string;
  gameSettings?: any;
  hasBuzzed: boolean;
  lastPlayedTrack?: Track | null;
  players?: Record<string, any>;
  playedCount?: number;
}>();

const emit = defineEmits<{
  (e: 'leave-game'): void;
  (e: 'configure-playlists'): void;
  (e: 'toggle-projector'): void;
  (e: 'play'): void;
  (e: 'stop'): void;
  (e: 'reveal'): void;
  (e: 'next-round'): void;
  (e: 'resume-music'): void;
  (e: 'correct-buzzer', points?: number, isBonus?: boolean): void;
  (e: 'auto-correct'): void;
  (e: 'load-playlist', tracks: Track[]): void;
  (e: 'update:searchQuery', val: string): void;
  (e: 'update:nextTrackInfo', val: { answer: string }): void;
  (e: 'open-settings'): void;
}>();

const isBonusDropdownOpen = ref(false);
const handleCorrectBuzzer = (points: number = 1, isBonus: boolean = false) => {
  isBonusDropdownOpen.value = false;
  emit('correct-buzzer', points, isBonus);
};

const handleSidebarDocClick = () => {
  if (isBonusDropdownOpen.value) {
    isBonusDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleSidebarDocClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleSidebarDocClick);
});

const handleToggleProjector = () => {
  emit('toggle-projector');
};

const localSearchQuery = ref(props.searchQuery);
const localNextTrackInfo = ref({ ...props.nextTrackInfo });

watch(localSearchQuery, (val) => emit('update:searchQuery', val));
watch(() => props.searchQuery, (val) => { localSearchQuery.value = val; });

watch(() => localNextTrackInfo.value.answer, () => {
  emit('update:nextTrackInfo', { answer: localNextTrackInfo.value.answer });
});
watch(() => props.nextTrackInfo.answer, (val) => {
  localNextTrackInfo.value.answer = val;
});

const validateBuzzerBtn = ref<any>(null);
const rejectBuzzerBtn = ref<any>(null);

defineExpose({
  validateBuzzerBtn,
  rejectBuzzerBtn
});
</script>
