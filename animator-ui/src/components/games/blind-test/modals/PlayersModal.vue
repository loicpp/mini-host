<template>
  <Modal v-if="isOpen" @close="$emit('close')" maxW="max-w-2xl">
    <div id="player-list" class="p-6">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-[#fff6e0] rounded-xl flex items-center justify-center shadow-sm">
            <Users class="w-5 h-5 text-[#FFBA49]" />
          </div>
          <h2 class="text-2xl font-bold text-primary">{{ $t('control_panel.manage_players') }}</h2>
        </div>
        <button id="players-modal-close-btn" @click="$emit('close')" class="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
          <X class="w-5 h-5" />
        </button>
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
              @click="$emit('open-actions', player)"
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
        <Btn variant="dark" size="md" @click="$emit('close')">{{ $t('control_panel.close') }}</Btn>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { Users, X, Settings, UserMinus } from '@lucide/vue';
import Modal from '../../../../components/ui/Modal.vue';
import Badge from '../../../../components/ui/Badge.vue';
import Btn from '../../../../components/ui/Btn.vue';
import { useGameStore } from '../../../../core/domain/general/stores/game';
import { useGamePlayers } from '../../../../core/domain/games/useGamePlayers';

defineProps<{
  isOpen: boolean
}>();

defineEmits<{
  (e: 'close'): void
  (e: 'open-actions', player: any): void
}>();

const { status } = useGameStore();
const { sortedPlayersList, removePlayer } = useGamePlayers();
</script>
