<template>
  <Modal v-if="isOpen && player" @close="$emit('close')" maxW="max-w-md">
    <div id="player-actions-modal" class="p-6">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shadow-sm">
            <Settings class="w-5 h-5 text-gray-600" />
          </div>
          <h2 class="text-xl font-bold text-primary">{{ $t('control_panel.actions') }} - {{ player.name }}</h2>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <div class="flex flex-col gap-6">
        <!-- Points Section -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm font-semibold text-muted-foreground uppercase tracking-wider m-0">{{ $t('control_panel.adjust_points') }}</p>
            <span class="font-black text-[#FFBA49] tabular-nums bg-amber-50 px-2 py-1 rounded-md">{{ (player.score || 0) + tempScoreAdjustment }} {{ $t('gameroom.pts') }}</span>
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
          <Btn id="player-actions-cancel-btn" variant="gray" @click="$emit('close')">{{ $t('app.cancel') }}</Btn>
          <Btn variant="primary" :disabled="!hasUnsavedChanges" @click="savePlayerActions">{{ $t('settings.save') }}</Btn>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Settings, X } from '@lucide/vue';
import Modal from '../../../../components/ui/Modal.vue';
import Btn from '../../../../components/ui/Btn.vue';
import { useGamePlayers } from '../../../../core/domain/games/useGamePlayers';

const props = defineProps<{
  isOpen: boolean;
  player: any | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save'): void; // Optional if we want parent to react
}>();

const { addPointsManually, setPlayerBlock } = useGamePlayers();

const tempScoreAdjustment = ref(0);
const tempBlockedTurns = ref(0);
const showUnblockOnly = ref(false);

watch(() => props.isOpen, (newVal) => {
  if (newVal && props.player) {
    tempScoreAdjustment.value = 0;
    tempBlockedTurns.value = props.player.blockedTurns || 0;
    showUnblockOnly.value = !!props.player.blockedTurns;
  }
});

const hasUnsavedChanges = computed(() => {
  if (!props.player) return false;
  const initialBlockedTurns = props.player.blockedTurns || 0;
  return tempScoreAdjustment.value !== 0 || tempBlockedTurns.value !== initialBlockedTurns;
});

const handleTempPoints = (points: number) => {
  if (!props.player) return;
  const currentScore = props.player.score || 0;
  let newTotal = currentScore + tempScoreAdjustment.value + points;
  if (newTotal < 0) {
    newTotal = 0;
  }
  tempScoreAdjustment.value = newTotal - currentScore;
};

const savePlayerActions = async () => {
  if (props.player) {
    if (tempScoreAdjustment.value !== 0) {
      await addPointsManually(props.player.id, tempScoreAdjustment.value);
    }
    if (tempBlockedTurns.value !== (props.player.blockedTurns || 0)) {
      await setPlayerBlock(props.player.id, tempBlockedTurns.value);
    }
  }
  emit('close');
  emit('save');
};

defineExpose({
  savePlayerActions
});
</script>
