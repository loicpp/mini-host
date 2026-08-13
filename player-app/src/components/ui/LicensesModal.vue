<template>
  <Modal :maxW="'max-w-2xl'" @close="$emit('close')">
    <div class="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white z-10 shrink-0">
      <h2 class="text-lg font-bold text-gray-800">{{ $t('licenses_modal.title') }}</h2>
      <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 focus:outline-none p-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    
    <div class="p-5 overflow-y-auto max-h-[70vh] bg-gray-50/50">
      <div class="space-y-3">
        <div v-for="(info, name) in licensesData" :key="name" class="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm">
          <div class="flex justify-between items-start mb-1">
            <h3 class="font-bold text-gray-800">{{ name }}</h3>
            <span class="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-blue-100">
              {{ info.licenses }}
            </span>
          </div>
          
          <div class="text-xs text-gray-500 space-y-0.5 mt-2">
            <p v-if="info.publisher"><span class="font-medium text-gray-400">{{ $t('licenses_modal.author') }}</span> {{ info.publisher }}</p>
            <p v-if="info.version"><span class="font-medium text-gray-400">{{ $t('licenses_modal.version') }}</span> {{ info.version }} ({{ info.language }})</p>
            <a v-if="info.repository" :href="info.repository" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-700 hover:underline inline-flex items-center mt-1">
              {{ $t('licenses_modal.view_project') }}
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
