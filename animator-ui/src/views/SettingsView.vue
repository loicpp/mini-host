<template>
  <main class="flex-1 overflow-y-auto relative p-0 w-full h-full">
    <SettingsScreen 
      :language="currentLanguage"
      @update:language="updateLanguage"
      @back="router.push('/')"
      @save="handleSave"
      @logout="handleLogout"
    />
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import SettingsScreen from '../components/general/SettingsScreen.vue';
import { currentLanguage } from '../core/domain/general/state';
import { useAuth } from '../core/domain/general/useAuth';

const router = useRouter();
const { logout, saveSettings, updateLanguage } = useAuth();

const handleSave = async () => {
  await saveSettings();
  router.push('/');
};

const handleLogout = async () => {
  const success = await logout();
  if (success) {
    router.push('/login');
  }
};
</script>
