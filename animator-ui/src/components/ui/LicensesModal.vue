<template>
  <Modal :maxW="'max-w-3xl'" @close="$emit('close')" overflowClass="overflow-hidden h-[80vh] flex flex-col">
    <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white z-10 shrink-0">
      <h2 class="text-xl font-bold text-gray-800">{{ $t('licenses_modal.title') }}</h2>
      <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 focus:outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    
    <div class="p-6 overflow-y-auto flex-1 bg-gray-50/50">
      <p class="text-sm text-gray-600 mb-6">
        {{ $t('licenses_modal.description') }}
      </p>

      <div class="space-y-4">
        <div v-for="(info, name) in licensesData" :key="name" class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-bold text-gray-800 text-lg">{{ name }}</h3>
            <span class="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
              {{ info.licenses }}
            </span>
          </div>
          
          <div class="text-sm text-gray-600 space-y-1">
            <p v-if="info.publisher"><span class="font-medium text-gray-500">{{ $t('licenses_modal.author') }}</span> {{ info.publisher }}</p>
            <p v-if="info.version"><span class="font-medium text-gray-500">{{ $t('licenses_modal.version') }}</span> {{ info.version }}</p>
            <p v-if="info.language"><span class="font-medium text-gray-500">{{ $t('licenses_modal.ecosystem') }}</span> {{ info.language }}</p>
            <a v-if="info.repository" :href="info.repository" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline inline-flex items-center mt-2 group">
              {{ $t('licenses_modal.view_project') }}
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-1 group-hover:translate-x-0.5 transition-transform"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Modal from './Modal.vue'

defineEmits(['close'])

const licensesData = ref<Record<string, any>>({})

onMounted(async () => {
  try {
    const response = await fetch('/licenses.json')
    if (response.ok) {
      licensesData.value = await response.json()
    }
  } catch (e) {
    console.error("Erreur lors du chargement des licences", e)
  }
})
</script>
