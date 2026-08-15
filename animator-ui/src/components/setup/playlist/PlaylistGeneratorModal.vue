<template>
  <Modal v-if="show" @close="$emit('close')">
    <div class="p-6">
      <h3 class="text-xl font-bold text-primary mb-4 flex items-center gap-2">
        <Wand2 class="w-5 h-5 text-[#FFBA49]" /> {{ $t('playlists.generate_playlist') }}
      </h3>
      
      <div class="flex flex-col gap-4 mb-6">
        <div>
          <label class="block text-sm font-bold text-primary mb-2">{{ $t('playlists.theme_label') }}</label>
          <TextInput v-model="generatorTheme" placeholder="ex: rock, 80s, disney..." inputClass="w-full px-4 py-2 bg-muted rounded-xl border-none text-foreground font-medium" focusClass="focus:ring-2 focus:ring-[#FFBA49] outline-none" clearable />
        </div>
        <div>
          <label class="block text-sm font-bold text-primary mb-2 flex justify-between">
            <span>{{ $t('playlists.track_count_label') }}</span>
            <span class="text-[#FFBA49]">{{ generatorLimit }}</span>
          </label>
          <Slider v-model="generatorLimit" :min="1" :max="20" />
        </div>
      </div>
      
      <div class="flex justify-end gap-3">
        <Btn variant="ghost" @click="$emit('close')" :disabled="isGenerating">{{ $t('playlists.cancel') }}</Btn>
        <Btn variant="primary" @click="handleGenerate" :disabled="isGenerating || !generatorTheme.trim()">
          <Loader2 v-if="isGenerating" class="w-4 h-4 mr-2 animate-spin" />
          <Wand2 v-else class="w-4 h-4 mr-2" />
          {{ isGenerating ? $t('playlists.generating') : $t('playlists.generate') }}
        </Btn>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Wand2, Loader2 } from '@lucide/vue';
import Btn from '../../ui/Btn.vue';
import Modal from '../../ui/Modal.vue';
import Slider from '../../ui/Slider.vue';
import TextInput from '../../ui/TextInput.vue';

const props = defineProps<{
  show: boolean;
  isGenerating: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'generate', theme: string, limit: number): void;
}>();

const generatorTheme = ref('');
const generatorLimit = ref(10);

watch(() => props.show, (newVal) => {
  if (newVal) {
    generatorTheme.value = '';
    generatorLimit.value = 10;
  }
});

const handleGenerate = () => {
  emit('generate', generatorTheme.value, generatorLimit.value);
};
</script>
