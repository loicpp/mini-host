<template>
  <div class="flex flex-col items-center justify-center min-h-full w-full relative p-6">
    <button class="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-primary font-bold text-sm transition-colors z-10" @click="$emit('back')">
      <ChevronLeft class="w-4 h-4" /> {{ $t('settings.back') }}
    </button>
    
    <div class="bg-white p-10 rounded-3xl border border-[rgba(0,0,0,0.08)] shadow-xl w-full max-w-lg">
      <h2 class="text-3xl font-black text-primary text-center mb-2 flex items-center justify-center gap-3">
        <Settings class="w-8 h-8 text-[#FFBA49]" /> {{ $t('settings.title') }}
      </h2>
      <p class="text-muted-foreground text-center mb-8">{{ $t('settings.subtitle') }}</p>
      
      <div class="flex flex-col gap-3 mb-8">
        <label class="font-bold text-primary">{{ $t('settings.language') }}</label>
        <select v-model="localLanguage" class="w-full px-4 py-3 bg-muted rounded-xl border-none text-foreground focus:ring-2 focus:ring-[#FFBA49] transition-shadow outline-none cursor-pointer font-medium">
          <option value="fr">🇫🇷 Français</option>
          <option value="en">🇬🇧 English</option>
        </select>
      </div>
      <div class="flex flex-col gap-4 mb-8 pt-6 border-t border-[rgba(0,0,0,0.08)]">
        <button class="flex items-center gap-3 p-4 bg-red-50 hover:bg-red-100 hover:border-red-200 transition-all duration-300 rounded-xl border border-red-100 text-left outline-none group" @click="$emit('logout')">
          <div class="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-red-500 shrink-0 shadow-sm">
            <LogOut class="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <div>
            <span class="block font-bold text-red-600 text-lg">{{ $t('settings.logout_title') }}</span>
            <span class="text-sm text-red-500/80">{{ $t('settings.logout_subtitle') }}</span>
          </div>
        </button>
      </div>

      <div class="flex gap-4">
        <Btn variant="soft" className="flex-1 font-bold" @click="$emit('back')">{{ $t('settings.cancel') }}</Btn>
        <Btn variant="primary" className="flex-1 font-bold" @click="handleSave">{{ $t('settings.save') }}</Btn>
      </div>
      
      <div class="text-center text-muted-foreground/50 text-sm mt-8 font-mono">
        {{ $t('settings.version') }} {{ appVersion }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ChevronLeft, Settings, LogOut } from '@lucide/vue';
import { useI18n } from 'vue-i18n';
import Btn from '../ui/Btn.vue';

const { locale } = useI18n();

const appVersion = import.meta.env.VITE_APP_VERSION || 'inconnue';

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'save'): void;
  (e: 'logout'): void;
  (e: 'update:language', val: string): void;
}>();

const localLanguage = ref(locale.value);

const handleSave = () => {
  locale.value = localLanguage.value;
  emit('update:language', localLanguage.value);
  emit('save');
};
</script>
