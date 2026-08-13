import { ref, reactive } from 'vue';

export const isTutorialActive = ref(false);
export const tutorialGameId = ref<string | null>(null);

export const tutorialState = reactive<{
  driverObj: any;
  playlistCreated: boolean;
  savedSearchQuery?: string;
  savedPlaylistName?: string;
  savedTrackInfo?: any;
}>({
  driverObj: null,
  playlistCreated: false
});
