<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click="closeModal">
    <div class="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl flex flex-col gap-4" @click.stop>
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-bold text-gray-900">{{ customPresets.length >= 4 ? (presetToReplace === null ? $t('create_game.preset_replace_title') : $t('create_game.preset_new_title')) : $t('create_game.preset_new_title') }}</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100">
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <div v-if="customPresets.length >= 4 && presetToReplace === null" class="flex flex-col gap-4">
        <p class="text-sm text-gray-600">{{ $t('create_game.preset_limit_reached') }}</p>
        <div class="grid grid-cols-2 gap-3">
          <OptionCard 
            v-for="(preset, index) in customPresets" :key="'replace-'+index"
            :title="preset.name" 
            :description="''" 
            layout="vertical"
            :selected="false"
            @click="presetToReplace = index"
          >
            <template #icon>
              <component :is="IconMap[preset.icon] || Star" class="w-4 h-4" />
            </template>
          </OptionCard>
        </div>
      </div>

      <div v-else class="flex flex-col gap-4">
        <div v-if="presetToReplace !== null" class="text-xs font-bold text-[#FFBA49] bg-[#FFF8E7] p-2 rounded-lg text-center">
          {{ $t('create_game.preset_replacing') }} "{{ customPresets[presetToReplace].name }}"
        </div>
        
        <div class="flex items-center gap-3">
          <div class="relative shrink-0">
            <button 
              @click="showIconPicker = !showIconPicker"
              class="w-12 h-12 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors z-30 relative"
            >
              <component :is="IconMap[presetIcon]" class="w-5 h-5 text-gray-700" />
            </button>
            
            <div v-if="showIconPicker" class="fixed inset-0 z-20" @click.stop="showIconPicker = false"></div>
            
            <div v-if="showIconPicker" class="absolute top-14 left-0 bg-white border border-gray-100 shadow-lg rounded-xl p-2 grid grid-cols-4 gap-2 z-30 w-48">
              <button 
                v-for="icon in availableIcons" :key="icon"
                @click="presetIcon = icon; showIconPicker = false"
                class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                :class="presetIcon === icon ? 'bg-[#FFF8E7] text-[#FFBA49]' : 'text-gray-600'"
              >
                <component :is="IconMap[icon]" class="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <input 
            v-model="presetName" 
            type="text" 
            maxlength="10"
            class="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 h-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFBA49]/50 focus:border-[#FFBA49] transition-all"
            :placeholder="$t('create_game.preset_placeholder')"
          />
        </div>
        
        <p v-if="presetError" class="text-red-500 text-xs font-medium">{{ presetError }}</p>
        
        <Btn variant="primary" size="lg" className="w-full mt-2" @click="saveCustomPreset">
          {{ $t('create_game.preset_save_btn') }}
        </Btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Btn from '../../ui/Btn.vue';
import OptionCard from '../../ui/OptionCard.vue';
import { Star, Bookmark, Heart, Zap, Coffee, Flame, Shield, X, Ghost, Gamepad2, Trophy, Target, Rocket } from '@lucide/vue';

import { usePresets } from '../../../core/domain/setup/presets/usePresets';
import { BLIND_TEST_ADDITIONAL_OPTIONS } from '../../../core/domain/games/blind-test/types/blindTestOptions';

const { t } = useI18n();

const props = defineProps<{
  show: boolean;
  customPresets: any[];
  currentSettings: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved', newPresets: any[]): void;
}>();

const { savePresets: savePresetsToApi } = usePresets();

const presetName = ref('');
const presetIcon = ref('Star');
const presetError = ref('');
const presetToReplace = ref<number | null>(null);
const showIconPicker = ref(false);
const availableIcons = ['Star', 'Bookmark', 'Heart', 'Zap', 'Coffee', 'Flame', 'Shield', 'Ghost', 'Gamepad2', 'Trophy', 'Target', 'Rocket'];
const IconMap: Record<string, any> = { Star, Bookmark, Heart, Zap, Coffee, Flame, Shield, Ghost, Gamepad2, Trophy, Target, Rocket };

watch(() => props.show, (newVal) => {
  if (newVal) {
    presetName.value = '';
    presetIcon.value = 'Star';
    presetError.value = '';
    presetToReplace.value = null;
    showIconPicker.value = false;
  }
});

const closeModal = () => {
  emit('close');
};

const savePresetsToBackend = async (presets: any[]) => {
  await savePresetsToApi(presets);
};

const saveCustomPreset = async () => {
  const name = presetName.value.trim().substring(0, 10);
  if (!name) {
    presetError.value = t('create_game.preset_name_required') || 'Nom requis';
    return;
  }
  
  const isDuplicate = props.customPresets.some((p, index) => 
    p.name.toLowerCase() === name.toLowerCase() && index !== presetToReplace.value
  );
  
  if (isDuplicate) {
    presetError.value = t('create_game.preset_name_exists') || 'Ce nom existe déjà';
    return;
  }
  
  const newPreset: any = {
    name: name,
    icon: presetIcon.value,
    blockDuration: props.currentSettings.blockDuration,
    musicDuration: props.currentSettings.musicDuration,
    duration: props.currentSettings.duration
  };

  BLIND_TEST_ADDITIONAL_OPTIONS.forEach(opt => {
    newPreset[opt.key] = props.currentSettings[opt.key];
  });

  if (props.customPresets.length >= 4 && presetToReplace.value === null) {
    presetError.value = t('create_game.preset_replace_required') || 'Veuillez choisir un preset à remplacer';
    return;
  }

  const updatedPresets = [...props.customPresets];
  if (presetToReplace.value !== null) {
    updatedPresets[presetToReplace.value] = newPreset;
  } else {
    updatedPresets.push(newPreset);
  }

  await savePresetsToBackend(updatedPresets);
  emit('saved', updatedPresets);
  closeModal();
};
</script>
