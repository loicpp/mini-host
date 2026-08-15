<template>
  <Modal @close="!isRunning && $emit('close')" maxW="max-w-xl">
    <div class="p-8">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 bg-[#fff6e0] rounded-xl flex items-center justify-center shadow-sm">
          <Activity class="w-5 h-5 text-[#FFBA49]" />
        </div>
        <h2 class="text-2xl font-black text-primary m-0">{{ $t('diagnostics.title') }}</h2>
      </div>
      <p class="text-muted-foreground mb-6">
        {{ $t('diagnostics.subtitle') }}
      </p>

      <div ref="containerRef" class="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-2 mb-8 py-2">
        <div 
          v-for="(step, index) in steps" 
          :key="index" 
          :id="'step-' + index" 
          :class="[
            'flex items-center gap-4 p-4 rounded-xl border transition-colors duration-300',
            step.status === 'success' ? 'bg-emerald-50/50 border-emerald-100' :
            step.status === 'warning' ? 'bg-orange-50/50 border-orange-200' :
            step.status === 'error' ? 'bg-red-50/50 border-red-100' :
            step.status === 'running' ? 'bg-amber-50/50 border-amber-100 shadow-sm' :
            'bg-muted/30 border-[rgba(0,0,0,0.05)]'
          ]"
        >
          <div class="text-2xl flex-shrink-0">
            <Loader2 v-if="step.status === 'running'" class="w-6 h-6 text-amber-500 animate-spin" />
            <CheckCircle2 v-else-if="step.status === 'success'" class="w-6 h-6 text-emerald-500" />
            <AlertTriangle v-else-if="step.status === 'warning'" class="w-6 h-6 text-orange-500" />
            <AlertCircle v-else-if="step.status === 'error'" class="w-6 h-6 text-red-500" />
            <Hourglass v-else class="w-6 h-6 text-muted-foreground/50" />
          </div>
          <div class="flex flex-col min-w-0">
            <span class="font-bold text-primary text-sm">{{ step.name }}</span>
            <span v-if="step.message" :class="[
              'text-xs truncate mt-0.5',
              step.status === 'success' ? 'text-emerald-700' :
              step.status === 'warning' ? 'text-orange-700 font-medium' :
              step.status === 'error' ? 'text-red-700' :
              step.status === 'running' ? 'text-amber-700 font-medium' :
              'text-muted-foreground'
            ]">{{ step.message }}</span>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <Btn variant="dark" @click="$emit('close')" :disabled="isRunning">
          {{ $t('diagnostics.close') }}
        </Btn>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Activity, Loader2, CheckCircle2, AlertCircle, Hourglass, AlertTriangle } from '@lucide/vue';
import Modal from '../ui/Modal.vue';
import Btn from '../ui/Btn.vue';
import { useDiagnostics } from '../../core/domain/diagnostics/useDiagnostics';

defineEmits<{
  (e: 'close'): void;
}>();

const { isRunning, steps, runDiagnostics } = useDiagnostics();
const containerRef = ref<HTMLElement | null>(null);

onMounted(() => {
  runDiagnostics();
});
</script>

